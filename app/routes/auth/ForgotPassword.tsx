import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { ForgotPasswordMutation } from "../../generated/graphql";
import { Input, Button } from "native-base";
import { Container } from "../../components/Container";

const ForgotPassword = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export function ForgotPasswordScreen(): JSX.Element {
  const [forgot, { loading }] =
    useMutation<ForgotPasswordMutation>(ForgotPassword);
  const [email, setEmail] = useState<string>("");

  const handleForgotPassword = () => {
    forgot({
      variables: { email },
    })
      .then(() => alert("Check your email for a link to reset your password!"))
      .catch((error) => alert(error.message));
  };

  return (
    <Container>
      <Input
        textContentType="emailAddress"
        placeholder="example@ridebeep.app"
        returnKeyType="go"
        onChangeText={(text) => setEmail(text)}
        onSubmitEditing={handleForgotPassword}
      />
      <Button
        isLoading={loading}
        isDisabled={!email}
        onPress={handleForgotPassword}
      >
        Send Password Reset Email
      </Button>
    </Container>
  );
}
