import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Mail, HelpCircle, BookOpen, Video } from 'lucide-react';

const TradeSupport = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Support Centre</h2>
      <Button>Contact Support</Button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5" />
            Live Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Get instant help from our support team</p>
          <p className="text-sm text-muted-foreground mb-4">Available: 9 AM - 6 PM, Mon-Fri</p>
          <Button className="w-full">Start Chat</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Phone Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Call us for urgent issues</p>
          <p className="text-sm text-muted-foreground mb-4">0800 123 4567</p>
          <Button variant="outline" className="w-full">
            Call Now
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Email Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Send us detailed questions</p>
          <p className="text-sm text-muted-foreground mb-4">support@tradepilot.co.uk</p>
          <Button variant="outline" className="w-full">
            Send Email
          </Button>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <h4 className="font-medium">Profile verification help</h4>
                <p className="text-sm text-muted-foreground">Ticket #TP-001</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Resolved</Badge>
            </div>
            <div className="flex justify-between items-center p-3 border rounded">
              <div>
                <h4 className="font-medium">Payment method update</h4>
                <p className="text-sm text-muted-foreground">Ticket #TP-002</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              Frequently Asked Questions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              User Guide
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Video className="h-4 w-4 mr-2" />
              Video Tutorials
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default TradeSupport;
