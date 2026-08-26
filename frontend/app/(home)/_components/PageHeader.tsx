export default function PageHeader() {
  return (
    <header className="mb-7 flex items-center justify-center">
      <div className="flex items-center gap-4">
        <div className="relative h-9 w-6 -rotate-[35deg] overflow-hidden rounded-[50%] border-[2px] border-[#5a4634] bg-[#765d47]">
          <div className="absolute -left-1 top-[17px] h-[2px] w-8 rotate-[-42deg] bg-[#e5d6c2]" />
        </div>

        <h1 className="font-serif text-[42px] font-semibold tracking-[-0.055em] text-[#39291d] sm:text-[50px]">
          Grids &amp; Circle
        </h1>
      </div>
    </header>
  );
}
