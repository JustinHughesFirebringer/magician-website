import axios from 'axios';
import { MagicianListing } from './data-validator';

export class DataEnricher {
  private readonly geocodingApiKey: string;
  private readonly placesApiKey: string;

  constructor(geocodingApiKey: string, placesApiKey: string) {
    this.geocodingApiKey = geocodingApiKey;
    this.placesApiKey = placesApiKey;
  }

  /**
   * Enriches a magician listing with additional data from various sources
   */
  async enrichListing(listing: MagicianListing): Promise<MagicianListing> {
    const enriched = { ...listing };

    try {
      // Add coordinates using geocoding
      const coordinates = await this.getCoordinates(enriched.location);
      if (coordinates) {
        enriched.location = {
          ...enriched.location,
          ...coordinates
        };
      }

      // Add business details if available
      if (enriched.businessName) {
        const businessDetails = await this.getBusinessDetails(
          enriched.businessName,
          enriched.location
        );
        if (businessDetails) {
          enriched.rating = businessDetails.rating;
          enriched.reviewCount = businessDetails.reviewCount;
          if (businessDetails.website) enriched.website = businessDetails.website;
          if (businessDetails.phone) enriched.phone = businessDetails.phone;
        }
      }

      // Find social media profiles
      const socialMedia = await this.findSocialMediaProfiles(
        enriched.name,
        enriched.businessName
      );
      if (Object.keys(socialMedia).length > 0) {
        enriched.socialMedia = socialMedia;
      }

    } catch (error) {
      console.error('Error enriching listing:', error);
    }

    return enriched;
  }

  /**
   * Gets coordinates for a location using a geocoding service
   */
  private async getCoordinates(location: { city: string; state: string }) {
    try {
      const address = `${location.city}, ${location.state}, USA`;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: this.geocodingApiKey
          }
        }
      );

      if (response.data.results && response.data.results[0]) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return {
          latitude: lat,
          longitude: lng
        };
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
    }
    return null;
  }

  /**
   * Gets business details from Google Places API
   */
  private async getBusinessDetails(
    businessName: string,
    location: { city: string; state: string }
  ) {
    try {
      // First, search for the business
      const searchResponse = await axios.get(
        'https://maps.googleapis.com/maps/api/place/textsearch/json',
        {
          params: {
            query: `${businessName} magician ${location.city} ${location.state}`,
            key: this.placesApiKey
          }
        }
      );

      if (searchResponse.data.results && searchResponse.data.results[0]) {
        const placeId = searchResponse.data.results[0].place_id;

        // Get detailed information
        const detailsResponse = await axios.get(
          'https://maps.googleapis.com/maps/api/place/details/json',
          {
            params: {
              place_id: placeId,
              fields: 'rating,user_ratings_total,website,formatted_phone_number',
              key: this.placesApiKey
            }
          }
        );

        if (detailsResponse.data.result) {
          const { result } = detailsResponse.data;
          return {
            rating: result.rating,
            reviewCount: result.user_ratings_total,
            website: result.website,
            phone: result.formatted_phone_number
          };
        }
      }
    } catch (error) {
      console.error('Error getting business details:', error);
    }
    return null;
  }

  /**
   * Finds social media profiles using various APIs and search techniques
   */
  private async findSocialMediaProfiles(
    name: string,
    businessName?: string
  ): Promise<{
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  }> {
    const socialMedia: {
      facebook?: string;
      instagram?: string;
      youtube?: string;
      twitter?: string;
    } = {};

    try {
      const searchQuery = businessName || `${name} magician`;

      // This is a placeholder for actual social media API calls
      // You would need to implement actual API calls to each platform
      // using their respective APIs and authentication

      // Example Facebook Graph API call (requires app token)
      // const facebookResponse = await axios.get(
      //   `https://graph.facebook.com/v12.0/search`,
      //   {
      //     params: {
      //       q: searchQuery,
      //       type: 'page',
      //       access_token: FACEBOOK_APP_TOKEN
      //     }
      //   }
      // );

      // Example Twitter API call (requires API key)
      // const twitterResponse = await axios.get(
      //   `https://api.twitter.com/2/users/by/username/${handle}`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${TWITTER_API_KEY}`
      //     }
      //   }
      // );

    } catch (error) {
      console.error('Error finding social media profiles:', error);
    }

    return socialMedia;
  }
}
