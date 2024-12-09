import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Contact Us</h1>
        
        <div className="bg-card rounded-lg p-6 shadow-lg">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-1">
                Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-card-foreground mb-1">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                placeholder="What is your message about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-card-foreground mb-1">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="Your message..."
                className="resize-none"
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

