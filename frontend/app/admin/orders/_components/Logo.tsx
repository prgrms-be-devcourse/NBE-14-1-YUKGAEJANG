export default function Logo() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-8 w-5 -rotate-[35deg] overflow-hidden rounded-[50%] border-2 border-[#5a4634] bg-[#765d47]">
        <div className="absolute -left-1 top-[15px] h-[2px] w-7 rotate-[-42deg] bg-[#eadccc]" />
      </div>

      <span className="font-serif text-[30px] tracking-[-0.055em] text-[#3d2d20]">
        Grids &amp; Circle
      </span>
    </div>
  );
}
