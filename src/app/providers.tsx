"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "@posthog/react";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { env } from "@/env";
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ph",
      ui_host: "https://us.posthog.com",
    });
  }, []);

  function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const userInfo = useUser();

    useEffect(() => {
      if (userInfo.user) {
        posthog.identify(userInfo.user.id, {
          email: userInfo.user.emailAddresses[0]?.emailAddress,
          firstName: userInfo.user.firstName,
          lastName: userInfo.user.lastName,
          fullName: userInfo.user.fullName,
        });
      } else if (!auth.isSignedIn) {
        posthog.reset();
      }
    }, [auth, userInfo.user]);

    return children;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PHProvider>
  );
}
