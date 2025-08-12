import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Profile = () => {
  return (
    <main className="container py-10">
      <SEO title="Your Profile — SpeakConnect" description="Set your level, goals, and learning schedule. Earn badges and track streaks." canonical="/profile" />
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile setup</CardTitle>
          <CardDescription>Tell us about your goals to personalize learning.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder="e.g. alex_learner" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" placeholder="e.g. India" />
          </div>
          <div className="grid gap-2">
            <Label>Level</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Learning goal</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="speaking">Improve speaking</SelectItem>
                <SelectItem value="vocabulary">Grow vocabulary</SelectItem>
                <SelectItem value="grammar">Better grammar</SelectItem>
                <SelectItem value="listening">Listening skills</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary">Save</Button>
            <Button variant="outline">Upload picture</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Profile;