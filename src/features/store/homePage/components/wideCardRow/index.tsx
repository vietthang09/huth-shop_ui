import { TWideCard } from "../../types";

import { WideCard } from "./WideCard";

type TProps = {
  cards: TWideCard[];
};

export const WideCardRow = ({ cards }: TProps) => {
  return (
    <div className="mt-8 w-full flex flex-col gap-4 md:flex-row">
      {cards.map((card, idx) => {
        const { imgUrl, smallTitle, title, url } = card;
        return <WideCard key={`${idx}-${title}`} imgUrl={imgUrl} smallTitle={smallTitle} title={title} url={url} />;
      })}
    </div>
  );
};
