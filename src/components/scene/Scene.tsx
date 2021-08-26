/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import { scene } from "../../configs/links";

type SceneProps = {
  isSkeleton: boolean;
  isConnected: boolean;
  amount: number;
  currency: string;
  address: string;
  onConnect?: () => void;
  onExit: () => void;
  children: React.ReactNode;
};

const Scene = ({
  isSkeleton,
  isConnected = false,
  amount,
  currency,
  address,
  onConnect,
  onExit,
  children,
}: SceneProps): JSX.Element => {
  const logo = [];
  const a = address.slice(2);
  for (let j = 0; j < 4; j += 1) {
    for (let i = 0; i < 4; i += 1) {
      const x = `${a[0]}${a[j * 4 + i * 16]}${a[j * 4 + i * 16 + 1]}${
        a[j * 4 + i * 16 + 2]
      }${a[63]}${a[j * 4 + i * 16 + 3]}`;
      logo.push(
        <circle key={x} cx={j * 10 + 3} cy={i * 10 + 3} r="7" fill={`#${x}`} />
      );
    }
  }
  const wallet =
    isConnected && !isSkeleton ? (
      <div className="wallet connected-wallet">
        <div className="amount">
          {amount} {currency}
        </div>
        <a className="box with-tooltip">
          <svg
            width="24"
            height="24"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0)">{logo}</g>
            <defs>
              <clipPath id="clip0">
                <rect width="36" height="36" rx="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span>{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
          <div className="hidden-text centered fix">{address}</div>
        </a>
        <a onClick={onExit}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              // eslint-disable-next-line max-len
              d="M14.4753 14.2903H15.295H16.1146V17.5162V19.9355H11.1966L11.1967 23L9.04917 22.2799L4.11633 20.662C3.4459 20.433 3 20.2782 3 20.2782V3H4.63938C4.66196 3 4.68378 3.00459 4.70558 3.00919C4.72248 3.01275 4.73936 3.0163 4.75659 3.01772C4.76929 3.01605 4.78125 3.01267 4.79315 3.00931C4.80968 3.00464 4.8261 3 4.84424 3H13.6556H16.1146V7.83872H15.295H14.4753L14.4754 4.61267L13.6556 4.61281H9.83757H7.91803L11.1966 5.41936V18.3226H14.4753V17.5162V14.2903ZM19.153 7.26859L23 11.0644C23 11.0644 22.7522 11.3194 22.4318 11.6346L19.153 14.8605L17.7541 16.2257L17.7539 11.8709H13.6556V11.0645V10.2581H17.7539L17.7541 5.90301L19.153 7.26859Z"
              fill="white"
            />
          </svg>
        </a>
      </div>
    ) : (
      <div className="wallet">
        <a className="box" onClick={onConnect}>
          Connect to a wallet
        </a>
      </div>
    );

  return (
    <div className={`widget${isSkeleton ? " loading" : ""}`}>
      <div className="container">
        <div className="header">
          <div className="logo">
            <svg
              width="120"
              height="18"
              viewBox="0 0 120 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M28.252 2.63997H37.492V4.42077H33.88V14.4H31.864V4.42077H28.252V2.63997Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M43.2366 14.5512C42.4526 14.5512 41.7358 14.428 41.0862 14.1816C40.4478 13.924 39.899 13.56 39.4398 13.0896C38.9918 12.608 38.6446 12.02 38.3982 11.3256C38.1518 10.6312 38.0286 9.84157 38.0286 8.95677V8.08317C38.0286 7.20957 38.1518 6.42557 38.3982 5.73117C38.6558 5.03677 39.0086 4.45437 39.4566 3.98397C39.9158 3.50237 40.4646 3.13277 41.103 2.87517C41.7526 2.61757 42.4638 2.48877 43.2366 2.48877C44.0206 2.48877 44.7318 2.61757 45.3702 2.87517C46.0198 3.12157 46.5686 3.48557 47.0166 3.96717C47.4758 4.44877 47.8286 5.03677 48.075 5.73117C48.3214 6.41437 48.4446 7.19837 48.4446 8.08317V8.95677C48.4446 9.83037 48.3158 10.6144 48.0582 11.3088C47.8118 12.0032 47.459 12.5912 46.9998 13.0728C46.5518 13.5544 46.003 13.924 45.3534 14.1816C44.715 14.428 44.0094 14.5512 43.2366 14.5512ZM43.2366 12.6696C44.155 12.6696 44.8998 12.3616 45.471 11.7456C46.0422 11.1184 46.3278 10.1888 46.3278 8.95677V8.08317C46.3278 7.47837 46.2494 6.94637 46.0926 6.48717C45.947 6.01677 45.7342 5.63037 45.4542 5.32797C45.1854 5.01437 44.8606 4.77917 44.4798 4.62237C44.099 4.45437 43.6846 4.37037 43.2366 4.37037C42.307 4.37037 41.5566 4.68397 40.9854 5.31117C40.4254 5.92717 40.1454 6.85117 40.1454 8.08317V8.95677C40.1454 10.1776 40.431 11.1016 41.0022 11.7288C41.5846 12.356 42.3294 12.6696 43.2366 12.6696Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M53.2976 6.67197L52.592 5.14317V14.4H50.576V2.63997H53.3984L57.4304 10.368L58.136 11.9136V2.63997H60.152V14.4H57.3296L53.2976 6.67197Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M73.9241 10.9896H68.8001L67.5569 14.4H66.3473L70.7153 2.63997H72.0593L76.4273 14.4H75.1841L73.9241 10.9896ZM69.2033 9.91437H73.5377L72.3449 6.67197L71.3705 3.98397L70.3961 6.67197L69.2033 9.91437Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M81.4258 14.5176C80.8882 14.5176 80.3954 14.428 79.9474 14.2488C79.5106 14.0696 79.1298 13.812 78.805 13.476C78.4914 13.14 78.245 12.7312 78.0658 12.2496C77.8978 11.7568 77.8138 11.1968 77.8138 10.5696V9.83037C77.8138 9.21437 77.8978 8.66557 78.0658 8.18397C78.245 7.69117 78.4914 7.27677 78.805 6.94077C79.1298 6.59357 79.5106 6.33037 79.9474 6.15117C80.3954 5.97197 80.8882 5.88237 81.4258 5.88237C81.8962 5.88237 82.3106 5.94397 82.669 6.06717C83.0386 6.19037 83.3578 6.36397 83.6266 6.58797C83.9066 6.80077 84.1306 7.05277 84.2986 7.34397C84.4778 7.63517 84.6122 7.94317 84.7018 8.26797H83.5258C83.3578 7.88717 83.1114 7.56797 82.7866 7.31037C82.473 7.05277 82.0194 6.92397 81.4258 6.92397C80.709 6.92397 80.1154 7.17597 79.645 7.67997C79.1858 8.17277 78.9562 8.88957 78.9562 9.83037V10.5696C78.9562 11.0288 79.0178 11.4432 79.141 11.8128C79.2642 12.1712 79.4378 12.4736 79.6618 12.72C79.8858 12.9664 80.1434 13.1568 80.4346 13.2912C80.737 13.4144 81.0674 13.476 81.4258 13.476C82.0306 13.476 82.4898 13.3416 82.8034 13.0728C83.117 12.804 83.3578 12.4344 83.5258 11.964H84.7018C84.5338 12.7032 84.181 13.3136 83.6434 13.7952C83.1058 14.2768 82.3666 14.5176 81.4258 14.5176Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M90.1078 14.5176C89.5702 14.5176 89.0774 14.428 88.6294 14.2488C88.1926 14.0696 87.8118 13.812 87.487 13.476C87.1734 13.14 86.927 12.7312 86.7478 12.2496C86.5798 11.7568 86.4958 11.1968 86.4958 10.5696V9.83037C86.4958 9.21437 86.5798 8.66557 86.7478 8.18397C86.927 7.69117 87.1734 7.27677 87.487 6.94077C87.8118 6.59357 88.1926 6.33037 88.6294 6.15117C89.0774 5.97197 89.5702 5.88237 90.1078 5.88237C90.5782 5.88237 90.9926 5.94397 91.351 6.06717C91.7206 6.19037 92.0398 6.36397 92.3086 6.58797C92.5886 6.80077 92.8126 7.05277 92.9806 7.34397C93.1598 7.63517 93.2942 7.94317 93.3838 8.26797H92.2078C92.0398 7.88717 91.7934 7.56797 91.4686 7.31037C91.155 7.05277 90.7014 6.92397 90.1078 6.92397C89.391 6.92397 88.7974 7.17597 88.327 7.67997C87.8678 8.17277 87.6382 8.88957 87.6382 9.83037V10.5696C87.6382 11.0288 87.6998 11.4432 87.823 11.8128C87.9462 12.1712 88.1198 12.4736 88.3438 12.72C88.5678 12.9664 88.8254 13.1568 89.1166 13.2912C89.419 13.4144 89.7494 13.476 90.1078 13.476C90.7126 13.476 91.1718 13.3416 91.4854 13.0728C91.799 12.804 92.0398 12.4344 92.2078 11.964H93.3838C93.2158 12.7032 92.863 13.3136 92.3254 13.7952C91.7878 14.2768 91.0486 14.5176 90.1078 14.5176Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M98.7899 14.5176C97.6811 14.5176 96.8019 14.1816 96.1523 13.5096C95.5027 12.8264 95.1778 11.8464 95.1778 10.5696V9.83037C95.1778 8.56477 95.5027 7.59037 96.1523 6.90717C96.8131 6.22397 97.6923 5.88237 98.7899 5.88237C99.8875 5.88237 100.761 6.22397 101.411 6.90717C102.071 7.59037 102.402 8.56477 102.402 9.83037V10.5192H96.3203V10.5696C96.3203 11.544 96.5443 12.272 96.9923 12.7536C97.4403 13.2352 98.0395 13.476 98.7899 13.476C99.4843 13.476 100.011 13.3304 100.369 13.0392C100.739 12.748 101.007 12.384 101.175 11.9472H102.318C102.228 12.3056 102.094 12.6416 101.915 12.9552C101.735 13.2688 101.5 13.5432 101.209 13.7784C100.918 14.0024 100.571 14.1816 100.167 14.316C99.7643 14.4504 99.3051 14.5176 98.7899 14.5176ZM98.7899 6.92397C98.0619 6.92397 97.4795 7.15357 97.0427 7.61277C96.6171 8.06077 96.3763 8.70477 96.3203 9.54477H101.243C101.198 8.67117 100.951 8.01597 100.503 7.57917C100.067 7.14237 99.4955 6.92397 98.7899 6.92397Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M108.718 14.5176C108.135 14.5176 107.62 14.4112 107.172 14.1984C106.724 13.9744 106.355 13.6328 106.063 13.1736V17.76H104.955V5.99997H105.811L105.946 7.41117C106.237 6.89597 106.612 6.51517 107.071 6.26877C107.542 6.01117 108.091 5.88237 108.718 5.88237C109.199 5.88237 109.642 5.96637 110.045 6.13437C110.448 6.30237 110.795 6.55437 111.087 6.89037C111.378 7.21517 111.602 7.62397 111.759 8.11677C111.927 8.60957 112.011 9.18077 112.011 9.83037V10.5696C112.011 11.208 111.927 11.7736 111.759 12.2664C111.602 12.7592 111.378 13.1736 111.087 13.5096C110.795 13.8456 110.448 14.0976 110.045 14.2656C109.642 14.4336 109.199 14.5176 108.718 14.5176ZM108.466 13.476C109.194 13.476 109.776 13.2408 110.213 12.7704C110.65 12.2888 110.868 11.5552 110.868 10.5696V9.83037C110.868 8.85597 110.644 8.12797 110.196 7.64637C109.759 7.16477 109.183 6.92397 108.466 6.92397C107.794 6.92397 107.228 7.15917 106.769 7.62957C106.321 8.09997 106.086 8.78877 106.063 9.69597V10.5696C106.063 11.5104 106.287 12.2328 106.735 12.7368C107.183 13.2296 107.76 13.476 108.466 13.476Z"
                fill="white"
              />
              <path
                // eslint-disable-next-line max-len
                d="M113.547 5.99997H115.059V3.64797H116.168V5.99997H118.419V7.00797H116.168V12.048C116.168 12.944 116.582 13.392 117.411 13.392H118.587V14.4H117.277C116.549 14.4 115.994 14.2152 115.614 13.8456C115.244 13.4648 115.059 12.9104 115.059 12.1824V7.00797H113.547V5.99997Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                // eslint-disable-next-line max-len
                d="M3.90891 1.15009C4.08473 0.928688 4.35091 0.799805 4.63236 0.799805H13.8971C14.1785 0.799805 14.4447 0.928688 14.6205 1.15009L18.3264 5.81676C18.6213 6.18812 18.5919 6.72348 18.2581 7.05977L9.91982 15.4598C9.55802 15.8243 8.97141 15.8243 8.6096 15.4598L0.271363 7.05977C-0.0624492 6.72348 -0.0918824 6.18812 0.203025 5.81676L3.90891 1.15009Z"
                fill="white"
              />
            </svg>
          </div>
          {wallet}
        </div>
        <div className="content">
          <div className="box">{children}</div>
        </div>
        <div className="footer">
          <div className="links">
            <a href={scene.termsOfUse}>Terms of use</a>
            <a href={scene.faq}>FAQ</a>
            <a href={scene.whatAreTip3Tokens}>What are TIP-3 tokens?</a>
          </div>
          <div className="dev">
            Developed by <a href={scene.broxus}>Broxus</a>. Powered by{" "}
            <a href={scene.freeTon}>FreeTON</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scene;