import HomeHero from "@/components/HomeHero";
import HomeProjects from "@/components/HomeProjects";
import HomeFeaturedPosts from "@/components/HomeFeaturedPosts";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <div className="container">
        <HomeProjects />
        <HomeFeaturedPosts />
      </div>
    </main>
  );
}
