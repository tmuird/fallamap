"use client";
import { cn } from "@/utils/cn";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";

import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button, Image, Textarea } from "@nextui-org/react";

import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Separator } from "@radix-ui/react-separator";
interface Falla {
  number: string;
  name: string;
  time: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}
interface PopupContentProps {
  falla: Falla;
}
export function PopupContent({ falla }: PopupContentProps) {
  return (
    <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem] md:grid-cols-5">
      {items(falla).map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={cn("[&>p:text-lg]", item.className)}
          // icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}
// const Skeleton = () => (
//   <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
// );
//
// const SkeletonOne = () => {
//   const variants = {
//     initial: {
//       x: 0,
//     },
//     animate: {
//       x: 10,
//       rotate: 5,
//       transition: {
//         duration: 0.2,
//       },
//     },
//   };
//   const variantsSecond = {
//     initial: {
//       x: 0,
//     },
//     animate: {
//       x: -10,
//       rotate: -5,
//       transition: {
//         duration: 0.2,
//       },
//     },
//   };
//
//   return (
//     <motion.div
//       initial="initial"
//       whileHover="animate"
//       className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
//     >
//       <motion.div
//         variants={variants}
//         className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-white dark:bg-black"
//       >
//         <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
//         <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
//       </motion.div>
//       <motion.div
//         variants={variantsSecond}
//         className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
//       >
//         <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
//         <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
//       </motion.div>
//       <motion.div
//         variants={variants}
//         className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-black"
//       >
//         <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
//         <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
//       </motion.div>
//     </motion.div>
//   );
// };
// const SkeletonTwo = () => {
//   const variants = {
//     initial: {
//       width: 0,
//     },
//     animate: {
//       width: "100%",
//       transition: {
//         duration: 0.2,
//       },
//     },
//     hover: {
//       width: ["0%", "100%"],
//       transition: {
//         duration: 2,
//       },
//     },
//   };
//   const arr = new Array(6).fill(0);
//   return (
//     <motion.div
//       initial="initial"
//       animate="animate"
//       whileHover="hover"
//       className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
//     >
//       {arr.map((_, i) => (
//         <motion.div
//           key={"skelenton-two" + i}
//           variants={variants}
//           style={{
//             maxWidth: Math.random() * (100 - 40) + 40 + "%",
//           }}
//           className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-neutral-100 dark:bg-black w-full h-4"
//         ></motion.div>
//       ))}
//     </motion.div>
//   );
// };
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2"
      style={{
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}
    >
      <motion.div className="h-full w-full rounded-lg">
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Image
                    width={300}
                    alt="NextUI hero Image"
                    src="https://nextui-docs-v2.vercel.app/images/hero-card-complete.jpeg"
                    radius="md"
                    className="h-[12rem]"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </motion.div>
    </motion.div>
  );
};

// const SkeletonFour = () => {
//   const first = {
//     initial: {
//       x: 20,
//       rotate: -5,
//     },
//     hover: {
//       x: 0,
//       rotate: 0,
//     },
//   };
//   const second = {
//     initial: {
//       x: -20,
//       rotate: 5,
//     },
//     hover: {
//       x: 0,
//       rotate: 0,
//     },
//   };
//   return (
//     <motion.div
//       initial="initial"
//       animate="animate"
//       whileHover="hover"
//       className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2"
//     >
//       <motion.div
//         variants={first}
//         className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
//       >
//         <img
//           src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
//           alt="avatar"
//           height="100"
//           width="100"
//           className="rounded-full h-10 w-10"
//         />
//         <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
//           Just code in Vanilla Javascript
//         </p>
//         <p className="border border-red-500 bg-red-100 dark:bg-red-900/20 text-red-600 text-xs rounded-full px-2 py-0.5 mt-4">
//           Delusional
//         </p>
//       </motion.div>
//       <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center">
//         <img
//           src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
//           alt="avatar"
//           height="100"
//           width="100"
//           className="rounded-full h-10 w-10"
//         />
//         <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
//           Tailwind CSS is cool, you know
//         </p>
//         <p className="border border-green-500 bg-green-100 dark:bg-green-900/20 text-green-600 text-xs rounded-full px-2 py-0.5 mt-4">
//           Sensible
//         </p>
//       </motion.div>
//       <motion.div
//         variants={second}
//         className="h-full w-1/3 rounded-2xl bg-white p-4 dark:bg-black dark:border-white/[0.1] border border-neutral-200 flex flex-col items-center justify-center"
//       >
//         <img
//           src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"
//           alt="avatar"
//           height="100"
//           width="100"
//           className="rounded-full h-10 w-10"
//         />
//         <p className="sm:text-sm text-xs text-center font-semibold text-neutral-500 mt-4">
//           I love angular, RSC, and Redux.
//         </p>
//         <p className="border border-orange-500 bg-orange-100 dark:bg-orange-900/20 text-orange-600 text-xs rounded-full px-2 py-0.5 mt-4">
//           Helpless
//         </p>
//       </motion.div>
//     </motion.div>
//   );
// };
const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  // const variantsSecond = {
  //   initial: {
  //     x: 0,
  //   },
  //   animate: {
  //     x: -10,
  //     rotate: -5,
  //     transition: {
  //       duration: 0.2,
  //     },
  //   },
  // };
  const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `v1.2.0-beta.${a.length - i}`,
  );
  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <ScrollArea>
        <div className="">
          <h4 className="mb-4 text-sm font-medium leading-none">Comments</h4>
          {tags.map((tag) => (
            <>
              <motion.div
                key={tag}
                variants={variants}
                className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-white dark:bg-black"
              >
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
                <span>Lorem ipsum</span>
              </motion.div>
              <Separator className="my-2" />
            </>
          ))}
        </div>
      </ScrollArea>
      {/*<motion.div*/}
      {/*    variants={variants}*/}
      {/*    className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2  items-start space-x-2 bg-white dark:bg-black">*/}

      {/*    <img*/}
      {/*        src="https://pbs.twimg.com/profile_images/1417752099488636931/cs2R59eW_400x400.jpg"*/}
      {/*        alt="avatar"*/}
      {/*        height="100"*/}
      {/*        width="100"*/}
      {/*        className="rounded-full h-10 w-10"*/}
      {/*    />*/}
      {/*    <p className="text-xs text-neutral-500">*/}
      {/*        There are a lot of cool framerworks out there like React, Angular,*/}
      {/*        Vue, Svelte that can make your life ....*/}

      {/*    </p>*/}

      {/*</motion.div>*/}
      {/*<motion.div*/}

      {/*    variants={variantsSecond}*/}
      {/*    className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-white dark:bg-black"*/}
      {/*        >*/}
      {/*            <p className="text-xs text-neutral-500">Use PHP.</p>*/}
      {/*            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />*/}
      {/*        </motion.div>*/}
    </motion.div>
  );
};
const items = (falla: Falla) => [
  {
    title: falla.name,
    description: (
      <div className="flex items-center justify-between">
        <span className="text-sm">Time: {falla.time}</span>
        <div className="flex space-x-2">
          <Button>Get Directions</Button>
          <Button isIconOnly color="danger" aria-label="Like"></Button>
        </div>
      </div>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-3",
  },
  {
    description: (
      <div className="flex items-center justify-between">
        <Textarea minRows={1} placeholder="Enter your comment" />
        <Button
          isIconOnly
          size="sm"
          radius="lg"
          color="success"
          aria-label="Like"
        ></Button>
      </div>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-2",
  },
];
