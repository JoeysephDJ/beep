import React from "react";
import { Box, useColorModeValue, IBoxProps } from "native-base";

interface Props {
  children: JSX.Element | JSX.Element[] | null;
}

export const LocalWrapper = (props: Props & IBoxProps): JSX.Element => {
  const { children, ...rest } = props;
  const bg = useColorModeValue("white", "black");

  return (
    <Box flex={1} bg={bg} {...rest}>
      {children}
    </Box>
  );
};
