import React, { useEffect, useState } from "react";
import ton, { hasTonProvider } from "ton-inpage-provider";
import { RootTokenContractV4 } from "./abi/RootTokenContractV4";
import { TONTokenWalletV4 } from "./abi/TONTokenWalletV4";
import { getTokensInfo } from "./api/tokens-info";
import { getCurrenciesDataInfo } from "./api/ton-swap";
import Connect from "./components/connect/Connect";
import Failed from "./components/failed/Failed";
import Pay from "./components/pay/Pay";
import Scene from "./components/scene/Scene";
import Success from "./components/success/Success";
import Waiting from "./components/waiting/Waiting";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import tonLogo from "./pic/TON.svg";

type Config = {
  currencies: string[];
  currenciesRemote: string;
  storeIcon: string;
  storeAddress: string;
  storeName: string;
};

type RequestPayment = {
  orderId: number;
  description: string;
  amount: number;
  currency: string;
  validUntilUtc: number;
  onSuccess: () => void;
  onFailure: () => void;
};

type RequestMultiCurPayment = {
  orderId: number;
  description: string;
  price: Map<string, number>;
  baseCur: string;
  validUntilUtc: number;
  onSuccess: () => void;
  onFailure: () => void;
};

export type CurrencyPriceBox = {
  currency: string;
  amount: number;
  label: string;
  currencyAddress: string;
  logo: string;
};

function App(): JSX.Element {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTheEnd, setIsTheEnd] = useState(false);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [config, setConfig] = useState<Config | null>(null);
  const [addresses, setAddresses] = useState<string[] | null>(null);
  const [requestPayment, setRequestPayment] = useState<RequestPayment | null>(
    null
  );
  const [requestMultiCurPayment, setRequestMultiCurPayment] =
    useState<RequestMultiCurPayment | null>(null);

  const [currencies, setCurrencies] = useState<string[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [isSkeleton, setIsSkeleton] = useState(true);

  const [balance, setBalance] = useState("");

  const getCurrenciesRemote = async (currenciesRemote: string) => {
    const response = await fetch(currenciesRemote);
    if (response.ok) {
      return response.json();
    }
    // eslint-disable-next-line no-console
    console.error(`getCurrenciesRemote error: ${response.status}`);
    return null;
  };

  const [orderId, setOrderId] = useState<number | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);

  const [hash, setHash] = useState<string | null>(null);

  const [currencyPriceBox, setCurrencyPriceBox] = useState<
    CurrencyPriceBox[] | null
  >(null);

  const [tokensInfo, setTokensInfo] = useState<{
    $schema: string;
    name: string;
    version: {
      major: number;
      minor: number;
      patch: number;
    };
    keywords: string[];
    timestamp: string;
    tokens: {
      name: string;
      chainId: number;
      symbol: string;
      decimals: number;
      address: string;
      logoURI: string;
      version: number;
    }[];
  } | null>(null);

  const [retryData, setRetryData] = useState<{
    currencyCode: string;
    currencyAddress: string;
  } | null>(null);

  window.addEventListener("message", (e) => {
    switch (e.data.command) {
      case "setRequestPayment":
        setRequestPayment(e.data.request);
        setConfig(e.data.config);
        setAddresses(e.data.addresses);
        break;
      case "setRequestMultiCurPayment":
        setRequestMultiCurPayment(e.data.request);
        setConfig(e.data.config);
        setAddresses(e.data.addresses);
        break;
      default:
        break;
    }
  });

  async function init() {
    if (!(await hasTonProvider())) {
      throw new Error("Extension is not installed");
    }
    await ton.ensureInitialized();

    const { accountInteraction } = await ton.rawApi.requestPermissions({
      permissions: ["tonClient", "accountInteraction"],
    });
    if (accountInteraction == null) {
      throw new Error("Insufficient permissions");
    } else {
      setSelectedAddress(accountInteraction.address);
      setPublicKey(accountInteraction.publicKey);
      setBalance(
        (
          await ton.getFullContractState({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            address: accountInteraction.address,
          })
        )?.state?.balance || ""
      );
    }
  }

  const payment = async () => {
    if (requestMultiCurPayment) {
      if (requestMultiCurPayment.orderId)
        setOrderId(requestMultiCurPayment.orderId);
      if (requestMultiCurPayment.description)
        setDescription(requestMultiCurPayment.description);
      if (requestMultiCurPayment.price) {
        const box = Array.from(requestMultiCurPayment.price.entries()).map(
          (item) => ({
            currency: item[0],
            amount: item[1],
            label: item[0] === "TON" ? "Native" : "TIP-3",
            currencyAddress:
              item[0].slice(0, 2) === "0:" && !Number.isNaN(+item[0].slice(2))
                ? item[0]
                : tokensInfo?.tokens.find((token) => token.symbol === item[0])
                    ?.address || "",
            logo:
              item[0] === "TON"
                ? tonLogo
                : tokensInfo?.tokens.find((token) => token.symbol === item[0])
                    ?.logoURI || "",
          })
        );
        setCurrencyPriceBox(box);
        const CUR = requestMultiCurPayment.baseCur;
        try {
          setAmount(box.find((item) => item.currency === CUR)?.amount || 0);
          setCurrency(CUR);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
        setLoading(false);
      }
    } else if (requestPayment && currencies) {
      if (requestPayment.orderId) setOrderId(requestPayment.orderId);
      if (requestPayment.description)
        setDescription(requestPayment.description);
      if (requestPayment.amount) setAmount(requestPayment.amount);
      if (requestPayment.currency) setCurrency(requestPayment.currency);

      let currenciesDataInfo: {
        code: string;
        price: number;
        address: string;
      }[];
      if (requestPayment.currency && requestPayment.currency !== "USDT") {
        const curToWtonArr = await getCurrenciesDataInfo(
          requestPayment.currency,
          tokensInfo?.tokens.find(
            (item) => item.symbol === requestPayment.currency
          )?.address || "",
          ["WTON"]
        );

        const curToWton = curToWtonArr ? curToWtonArr[0].price : null;

        if (curToWton && curToWtonArr?.[0]) {
          currenciesDataInfo =
            (
              await getCurrenciesDataInfo(
                "WTON",
                tokensInfo?.tokens.find((item) => item.symbol === "WTON")
                  ?.address || "",
                currencies
              )
            )
              ?.map((item) => ({
                ...item,
                price: item.price * curToWton,
              }))
              .concat(curToWtonArr[0]) || [];
        }
      } else {
        currenciesDataInfo =
          (await getCurrenciesDataInfo(
            requestPayment.currency || "USDT",
            tokensInfo?.tokens.find(
              (item) => item.symbol === requestPayment.currency
            )?.address || "",
            currencies.map((item) => (item === "TON" ? "WTON" : item))
          )) || [];
      }

      if (currencies) {
        const box = currencies
          .map((item) =>
            item.slice(0, 2) === "0:" && !Number.isNaN(item.slice(2))
              ? currenciesDataInfo?.find((cur) => cur.address === item)?.code ||
                item
              : item
          )
          .map((item) => {
            const relativePrice = currenciesDataInfo?.find((cur) =>
              item === "TON" ? cur.code === "WTON" : cur.code === item
            )?.price;
            return {
              currency: item,
              amount:
                // eslint-disable-next-line no-nested-ternary
                item === requestPayment.currency
                  ? requestPayment.amount
                  : relativePrice
                  ? requestPayment.amount * relativePrice
                  : 0,
              label: item === "TON" ? "Native" : "TIP-3",
              currencyAddress:
                tokensInfo?.tokens.find((token) => token.symbol === item)
                  ?.address || "",
              logo:
                item === "TON"
                  ? tonLogo
                  : tokensInfo?.tokens.find((token) => token.symbol === item)
                      ?.logoURI || "",
            };
          });
        setCurrencyPriceBox(box);
        setLoading(false);
      }
    } else {
      throw Error();
    }
  };

  const currenciesCheck = async (cur: string[]) => {
    const info = await getTokensInfo();
    setCurrencies(
      cur.filter((c) => {
        const find = !!info.tokens.find((item: any) => item.symbol === c);
        const custom = c.slice(0, 2) === "0:" && !Number.isNaN(c.slice(2));
        if (!find && c !== "TON" && !custom)
          // eslint-disable-next-line no-console
          console.error(`"${c}" is not correct currency symbol`);
        return c === "TON" || custom || find;
      })
    );
    setTokensInfo(info);
  };

  useEffect(() => {
    if (config && addresses && (requestPayment || requestMultiCurPayment)) {
      if (config.currencies && config.currencies.length < 1) {
        if (config.currenciesRemote) {
          getCurrenciesRemote(config.currenciesRemote)
            .then((c) => {
              if (c) {
                throw Error("getCurrenciesRemote failed");
              } else {
                currenciesCheck(c);
              }
            })
            // eslint-disable-next-line no-console
            .catch((e) => console.error(e));
        } else {
          // eslint-disable-next-line no-console
          console.error("no currencies");
        }
      } else if (requestMultiCurPayment?.price) {
        currenciesCheck(
          Array.from(requestMultiCurPayment.price).map((item) => item[0])
        );
      } else if (config.currencies) {
        currenciesCheck(config.currencies);
      } else {
        // eslint-disable-next-line no-console
        console.error("no currencies");
      }
    }
  }, [config, addresses, requestPayment, requestMultiCurPayment]);

  useEffect(() => {
    if (tokensInfo) {
      payment();
    }
  }, [tokensInfo]);

  const onPay = async (currencyCode: string, currencyAddress: string) => {
    setIsPaymentStart(true);
    const amountInChooseCurrency = currencyPriceBox?.find(
      (item) => item.currency === currencyCode
    )?.amount;
    if (publicKey && addresses && selectedAddress && amountInChooseCurrency) {
      try {
        if (currencyCode === "TON") {
          const { transaction: tonTransaction } = await ton.rawApi.sendMessage({
            sender: selectedAddress,
            recipient: addresses[Math.floor(Math.random() * addresses.length)],
            amount: String(Math.round(amountInChooseCurrency * 1000000000)),
            bounce: true,
          });

          setHash(tonTransaction.id.hash);
          setIsSuccess(true);
        } else {
          const randomAddress =
            addresses[Math.floor(Math.random() * addresses.length)];

          const { output: output1 } = await ton.rawApi.runLocal({
            address: currencyAddress,
            functionCall: {
              abi: RootTokenContractV4,
              method: "getWalletAddress",
              params: {
                _answer_id: 1, // ?
                wallet_public_key_: "0",
                owner_address_: selectedAddress,
              },
            },
          });
          const walletAddress1 = output1 && String(output1?.value0);

          const { output: output2 } = await ton.rawApi.runLocal({
            address: currencyAddress,
            functionCall: {
              abi: RootTokenContractV4,
              method: "getWalletAddress",
              params: {
                _answer_id: 1, // ?
                wallet_public_key_: "0",
                owner_address_: randomAddress,
              },
            },
          });
          const walletAddress2 = output2 && String(output2?.value0);

          const { output: decimalsOutput } = await ton.rawApi.runLocal({
            address: currencyAddress,
            functionCall: {
              abi: RootTokenContractV4,
              method: "decimals",
              params: {},
            },
          });
          const decimals = decimalsOutput?.decimals;

          if (walletAddress1 && walletAddress2 && decimals) {
            const { transaction } = await ton.rawApi.sendMessage({
              payload: {
                abi: TONTokenWalletV4,
                method: "transfer",
                params: {
                  to: walletAddress2,
                  tokens: String(
                    Math.round(amountInChooseCurrency * 10 ** +decimals)
                  ), // ?
                  grams: "1000000000",
                  send_gas_to: selectedAddress,
                  notify_receiver: true,
                  payload: "",
                },
              },
              sender: selectedAddress,
              recipient: walletAddress1,
              amount: "100000000",
              bounce: true,
            });

            setHash(transaction.id.hash);
            setIsSuccess(true);
          } else {
            throw Error();
          }
        }
        setIsTheEnd(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        if (error.message !== "The request was rejected; please try again") {
          setIsTheEnd(true);
        } else {
          setRetryData({
            currencyCode,
            currencyAddress,
          });
        }
      }
    }
  };

  const onCancel = () => {
    setIsConnected(false);
  };

  const onConnect = () => {
    setIsSkeleton(true);
    setIsConnected(true);
    init()
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
        setIsConnected(false);
      })
      .then(() => setIsSkeleton(false));
  };

  const onRetry = () => {
    if (
      retryData?.currencyCode === "TON" ||
      (retryData?.currencyCode && retryData?.currencyAddress)
    ) {
      onPay(retryData.currencyCode, retryData.currencyAddress);
    }
  };

  const onSucsess = () => {
    window.parent.postMessage(
      {
        command: "success",
        hash,
      },
      "*"
    );
  };

  const onFailure = () => {
    window.parent.postMessage(
      {
        command: "failure",
        hash,
      },
      "*"
    );
  };

  const onGoBack = () => {
    setIsPaymentStart(false);
    setIsTheEnd(false);
    setIsSuccess(false);
  };

  useEffect(() => {
    if (!isConnected) {
      ton.disconnect();
      setIsTheEnd(false);
      setIsPaymentStart(false);
      setIsSuccess(false);
    }
  }, [isConnected]);

  if (loading) return <>Loading...</>;

  if (
    amount !== null &&
    currency !== null &&
    orderId !== null &&
    description !== null &&
    currencyPriceBox !== null &&
    currencyPriceBox.length >= 1
  )
    return (
      <Scene
        isSkeleton={isSkeleton}
        isConnected={isConnected}
        amount={+balance / 1000000000} // todo
        currency="TON" // todo
        address={selectedAddress || ""}
        onExit={onCancel}
        onConnect={onConnect}
      >
        <>
          {!isConnected && (
            <Connect
              storeName={config?.storeName}
              storeAddress={config?.storeAddress}
              storeIcon={config?.storeIcon}
              orderId={orderId}
              description={description}
              amount={amount}
              onCancel={onFailure}
              onConnect={onConnect}
            />
          )}
          {isConnected &&
            !isTheEnd &&
            (!isPaymentStart ? (
              <Pay
                isSkeleton={isSkeleton}
                storeName={config?.storeName}
                storeAddress={config?.storeAddress}
                storeIcon={config?.storeIcon}
                orderId={orderId}
                description={description}
                amount={amount}
                currencies={currencyPriceBox}
                onCancel={onFailure}
                onPay={onPay}
              />
            ) : (
              <Waiting
                storeIcon={config?.storeIcon}
                orderId={orderId}
                description={description}
                amount={amount}
                onCancel={onFailure}
                onRetry={onRetry}
              />
            ))}
          {isConnected &&
            isTheEnd &&
            (isSuccess ? (
              <Success
                orderId={orderId}
                storeIcon={config?.storeIcon}
                description={description}
                amount={amount}
                currency={currency}
                hash={hash || ""} // todo
                onClose={onSucsess}
              />
            ) : (
              <Failed
                orderId={orderId}
                onClose={onFailure}
                onGoBack={onGoBack}
              />
            ))}
        </>
      </Scene>
    );

  return <div>Error</div>;
}

export default App;
