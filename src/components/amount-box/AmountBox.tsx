import React from "react";

type AmountBoxProps = {
  amount: number;
  description: string;
};

const AmountBox = ({ amount, description }: AmountBoxProps): JSX.Element => {
  return (
    <>
      <div className="amount">
        <span>
          $
          {`${Math.floor(amount)}.${"00"
            .concat(String(amount * 100 - Math.floor(amount) * 100))
            .slice(-2)}`}
        </span>
        <p>{description}</p>
      </div>
    </>
  );
};

export default AmountBox;
