import React from "react";
import { Container } from "../../components/Container";
import { gql, useMutation } from "@apollo/client";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  FormControl,
  Input,
  Stack,
  WarningOutlineIcon,
} from "native-base";
import {
  isValidationError,
  useValidationErrors,
} from "../../utils/useValidationErrors";
import {
  CreateFeedbackMutation,
  CreateFeedbackMutationVariables,
} from "../../generated/graphql";
import { Alert } from "react-native";

const CreateFeedback = gql`
  mutation CreateFeedback($message: String!) {
    createFeedback(message: $message) {
      id
    }
  }
`;

export function Feedback() {
  const [createFeedback, { loading, error }] =
    useMutation<CreateFeedbackMutation>(CreateFeedback);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      message: "",
    },
  });

  const validationErrors =
    useValidationErrors<CreateFeedbackMutationVariables>(error);

  const onSubmit = handleSubmit((variables) => {
    createFeedback({ variables })
      .then(() => {
        Alert.alert(
          "Thank you for your feedback!",
          "We will contact you if we have any further questions"
        );
      })
      .catch((error) => {
        if (!isValidationError(error)) {
          alert(error);
        }
      });
  });

  return (
    <Container p={3} keyboard>
      <Stack space={2}>
        <FormControl
          isInvalid={
            Boolean(errors.message) || Boolean(validationErrors?.message)
          }
        >
          <FormControl.Label>Feedback</FormControl.Label>
          <Controller
            name="message"
            rules={{ required: "Message is required" }}
            control={control}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Input
                minHeight={170}
                multiline
                onBlur={onBlur}
                onChangeText={(val) => onChange(val)}
                value={value}
                ref={ref}
                size="lg"
              />
            )}
          />
          <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
            {errors.message?.message}
            {validationErrors?.message?.[0]}
          </FormControl.ErrorMessage>
        </FormControl>
        <Button
          onPress={onSubmit}
          isLoading={loading}
          _text={{ fontWeight: "extrabold" }}
        >
          Submit
        </Button>
      </Stack>
    </Container>
  );
}
