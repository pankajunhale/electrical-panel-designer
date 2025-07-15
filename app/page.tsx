import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Search,
  Zap,
  Sparkles,
  Star,
  Users,
  Palette,
  BarChart3,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SamCon
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              />
            </div>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Built with Next.js 15 & shadcn/ui
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            &quot;Empowering Electrical Panel Design&quot;
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Streamline your electrical panel design process with our
            comprehensive &quot;EP Designer&quot; application. From basic system
            details to detailed panel specifications, we&apos;ve got you
            covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/cp/panel-design">
                Get Started
                <Zap className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/cp">
                View Dashboard
                <BarChart3 className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Beautiful Design</CardTitle>
              <CardDescription>
                Pre-built components that look great out of the box and are
                fully customizable.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Fast Development</CardTitle>
              <CardDescription>
                Build faster with our comprehensive component library and
                developer tools.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Accessible</CardTitle>
              <CardDescription>
                All components follow WAI-ARIA guidelines and support keyboard
                navigation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Loved by Developers</h2>
          <p className="text-slate-600 dark:text-slate-400">
            See what others are saying about shadcn/ui
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Sarah Chen</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Frontend Developer
                  </div>
                </div>
                <div className="flex ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                &quot;shadcn/ui has completely transformed how I build UIs. The
                components are beautiful, accessible, and incredibly easy to
                customize. It&apos;s become an essential part of my
                toolkit.&quot;
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src="https://github.com/vercel.png" />
                  <AvatarFallback>VR</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">Mike Rodriguez</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Full Stack Developer
                  </div>
                </div>
                <div className="flex ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                &quot;The combination of Next.js 15 and shadcn/ui is absolutely
                incredible. I can build production-ready applications in record
                time with beautiful, consistent design.&quot;
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              &quot;EP Designer&quot; - Your Complete Solution
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Experience the power of &quot;EP Designer&quot; - the ultimate
              tool for electrical panel design and documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Sparkles className="w-4 h-4 mr-2" />
                Explore Components
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">SamCon</span>
            </div>
            <div className="flex space-x-6 text-sm text-slate-600 dark:text-slate-400">
              <a
                href="#"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Documentation
              </a>
              <a
                href="#"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Components
              </a>
              <a
                href="#"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                GitHub
              </a>
              <a
                href="#"
                className="hover:text-slate-900 dark:hover:text-white"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
