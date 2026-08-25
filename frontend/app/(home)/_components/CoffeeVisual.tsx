import { Product } from '@/app/_shared/apis/productApi.type';

// FIXME: 상품 이미지로 대체하기
export default function CoffeeVisual({ product }: { product: Product }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[20px] bg-[#eee2d0]">
      {/* background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,#fff9ef_0%,#eee1ce_72%)]" />

      {/* coffee bag */}
      <div className="absolute bottom-[11%] left-[19%] h-[53%] w-[32%] rotate-[1deg] rounded-[4px] bg-[#f7f0e5] shadow-[0_5px_10px_rgba(75,48,25,.12)]">
        <div className="absolute left-[12%] right-[12%] top-[12%] h-[24%] rounded-sm bg-[#40553c]">
          <div className="pt-2 text-center text-[5px] font-medium tracking-[1px] text-white/80">
            SINGLE
          </div>
          <div className="text-center text-[5px] tracking-[1px] text-white/80">
            ORIGIN
          </div>
        </div>

        <div className="absolute left-0 right-0 top-[45%] text-center font-serif text-[10px] leading-3 tracking-[2px] text-[#776550]">
          COL
          <br />
          OMBI
          <br />
          A
        </div>

        <div className="absolute bottom-[9%] left-0 right-0 text-center text-[5px] tracking-[1px] text-[#a49178]">
          {product.origin.split(" ")[0].toUpperCase()}
        </div>
      </div>

      {/* ceramic vase */}
      <div className="absolute bottom-[7%] right-[16%] h-[70%] w-[20%]">
        <div className="absolute left-[30%] top-0 h-[25%] w-[40%] rounded-t-[50%] bg-[#e9dfce]" />
        <div className="absolute bottom-0 left-0 right-0 h-[78%] rounded-[42%_42%_18%_18%] bg-[#e8dece] shadow-[3px_5px_8px_rgba(80,50,25,.12)]" />
        <div className="absolute bottom-[8%] left-[15%] right-[15%] h-[58%] opacity-30">
          <div className="absolute left-[18%] h-full w-[3px] bg-[#b9aa91]" />
          <div className="absolute left-[38%] h-full w-[3px] bg-[#b9aa91]" />
          <div className="absolute left-[58%] h-full w-[3px] bg-[#b9aa91]" />
          <div className="absolute left-[78%] h-full w-[3px] bg-[#b9aa91]" />
        </div>
      </div>

      {/* coffee beans */}
      <div className="absolute bottom-[7%] left-[39%] flex -rotate-[7deg] gap-[-2px]">
        {[...Array(12)].map((_, index) => (
          <span
            key={index}
            className="relative -ml-1 h-[8px] w-[13px] rounded-[50%] bg-[#4c2e18] shadow-sm"
            style={{
              transform: `translateY(${
                Math.sin(index * 1.7) * 5
              }px) rotate(${index * 8 - 20}deg)`,
            }}
          />
        ))}
      </div>

      {/* subtle label */}
      <div className="absolute bottom-3 right-3 rounded-full bg-white/40 px-2 py-1 text-[7px] text-[#765f48] backdrop-blur">
        SINGLE ORIGIN
      </div>
    </div>
  );
}