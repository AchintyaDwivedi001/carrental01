import Carousels from "@/components/Carousel";
import Explore from "@/components/Explore";
import OurObjective from "@/components/OurObjective";
import Subfooter from "@/components/Subfooter";
import Image from "next/image";
import AIConcierge from '@/components/AIConcierge';

export default function Home() {
  return (
    <div className="">
      <Carousels />
      <div className="relative">
        <Explore />
        
        {/* --- AI CONCIERGE SECTION --- */}
        <section className="py-12 bg-gray-50 z-10 relative">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-center text-3xl font-bold mb-6">Ask Our AI Trip Concierge</h2>
            <AIConcierge /> 
          </div>
        </section>
        {/* ---------------------------- */}

        <Subfooter />
        <OurObjective />
      </div>
    </div>
  );
}