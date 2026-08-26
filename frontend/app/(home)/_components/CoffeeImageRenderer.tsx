import Image from 'next/image';

type TProps = {
  imageNumber?: number;
  imageUrl?: string;
};

export default function CoffeeImageRenderer(props: TProps) {
  const {
    imageNumber = 0,
    imageUrl,
  } = props;

  const imageSrc = imageUrl || `/imgs/product_type_${imageNumber}.png`;

  return (
    <figure className="relative h-full w-full overflow-hidden rounded-[20px]">
      <Image 
        className="object-contain"
        src={imageSrc}
        alt="product"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="eager"
      />
    </figure>
  );
}
