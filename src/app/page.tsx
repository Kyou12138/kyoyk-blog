import dynamic from "next/dynamic";

const GalaxyEffect = dynamic(() => import("@/components/GalaxyEffect"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen">
      <div className="w-full h-screen fixed top-0 left-0 -z-10 overflow-hidden">
        <GalaxyEffect />
      </div>
    </main>
  );
}
