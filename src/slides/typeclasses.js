import React from "react";
import catsLogo from "../assets/cats-logo.png";

import {
  Slide,
  Text,
  Heading,
  BlockQuote,
  Quote,
  Cite,
  Image,
  Code,
  CodePane,
  Appear,
  S
} from "spectacle";

export default function Typeclasses() {
  const examples = [
    "1 + 2 = 3",
    "3.14 + 0.0015 = 3.1415",
    "1 + 3.7 = 4.7",
    "[1, 2, 3] + [4, 5, 6] = [1, 2, 3, 4, 5, 6]",
    "[true, false] + [false, true] = [true, false, false, true]",
    '"bab" + "oon" = "baboon"'
  ];
  return [
    <Slide>
      <Heading>Typeclasses</Heading>
    </Slide>,
    <Slide textColor="primary" bgColor="secondary">
      <BlockQuote>
        <Quote>
          Type classes are a powerful tool used in functional programming to
          enable ad-hoc polymorphism, more commonly known as overloading.
        </Quote>
        <Cite>
          <Image
            margin="0"
            display="inline-block"
            src={catsLogo}
            width="50px"
          />
        </Cite>
      </BlockQuote>
    </Slide>,
    <Slide>
      <div
        style={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Heading>Ad-hoc polymorphism</Heading>
        {examples.map(e => (
          <Appear>
            <Code>{e}</Code>
          </Appear>
        ))}
      </div>
    </Slide>,
    <Slide>
      <div style={{
        marginBottom: '5em'
      }}>
        <Text>
          Object oriented languages leverage <S type="bold">sub-typing</S> for
          polymorphic code
        </Text>
        </div>
        <Appear>
          <Text>
            Functional languages combine{" "}
            <S type="bold">parametric polymorphism</S> and{" "}
            <S type="bold">ad-hoc polymorphism</S>
          </Text>
        </Appear>
    </Slide>
  ];
}
