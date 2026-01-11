import HomeButtons from "@/components/home-buttons";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-brand-dark text-white">
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-deep to-brand-dark opacity-90" />

      {/* Abstract Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-blue/20 rounded-full blur-[80px]" />

      <main className="z-10 flex flex-col items-center gap-8 text-center px-4 animate-fade-in-up">
        {/* Title */}
        {/* <h1 className="text-7xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
          Emporium
        </h1> */}
        <p className="text-xl text-white/60 max-w-lg">
          Hedge bets on your team's performance
        </p>

        {/* Buttons */}
        <HomeButtons />
      </main>
    </div>
  );
}
