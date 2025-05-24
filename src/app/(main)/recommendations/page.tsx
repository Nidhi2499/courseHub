"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Sparkles, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { getPersonalizedCourseRecommendations } from "@/ai/flows/course-recommendation";
import { courseRecommendationSchema } from "@/lib/validation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type RecommendationFormValues = z.infer<typeof courseRecommendationSchema>;

export default function RecommendationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(courseRecommendationSchema),
    defaultValues: {
      interests: "",
      learningHistory: "",
    },
  });

  const onSubmit = async (data: RecommendationFormValues) => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const result = await getPersonalizedCourseRecommendations({
        interests: data.interests,
        learningHistory: data.learningHistory || "No prior learning history provided.",
      });
      if (result.courseRecommendations && result.courseRecommendations.length > 0) {
        setRecommendations(result.courseRecommendations);
        toast({
          title: "Recommendations Ready!",
          description: "Here are some courses tailored for you.",
        });
      } else {
        setRecommendations([]);
         toast({
          title: "No specific recommendations found",
          description: "Try broadening your interests or check back later!",
        });
      }
    } catch (err) {
      console.error("Recommendation error:", err);
      const errorMessage = (err instanceof Error ? err.message : String(err)) || "Failed to get recommendations. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary inline-flex items-center">
          <Sparkles className="mr-3 h-8 w-8 text-accent" />
          Personalized Recommendations
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tell us about yourself and get course suggestions tailored to your
          interests.
        </p>
      </div>

      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Find Your Next Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Interests</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., AI, Web Development, Photography"
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormDescription>
                      List a few topics or skills you&apos;re interested in.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="learningHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Learning History (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Completed 'Intro to Python', Started 'Graphic Design Basics'"
                        {...field}
                        className="min-h-[100px] bg-background"
                      />
                    </FormControl>
                    <FormDescription>
                      Tell us about courses you&apos;ve taken or skills you&apos;ve
                      already acquired.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Recommendations
              </Button>
            </form>
          </Form>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-xl font-semibold text-foreground">
                Here are your personalized recommendations:
              </h3>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start rounded-md border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                  >
                    <ThumbsUp className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="text-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
           {!isLoading && !error && recommendations.length === 0 && form.formState.isSubmitted && (
             <Alert className="mt-6">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>No Specific Recommendations Yet</AlertTitle>
              <AlertDescription>
                We couldn&apos;t find specific recommendations based on your input. Try adjusting your interests or check our general course catalog.
              </AlertDescription>
            </Alert>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
