import Image from 'next/image';

const NextJsIcon = ({ className }: { className?: string }) => (
    <>
        <Image
            src="/svgs/nextjs2-dark.svg"
            alt="Next.js"
            width={40}
            height={40}
            className={`hidden dark:block ${className || ''}`}
        />
        <Image
            src="/svgs/next-js-light.svg"
            alt="Next.js"
            width={40}
            height={40}
            className={`dark:hidden ${className || ''}`}
        />
    </>
);

export default NextJsIcon;