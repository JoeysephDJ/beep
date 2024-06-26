import React from "react";
import { Card } from "@/components/Card";
import { Text } from "@/components/Text";

interface Props {
  position: number;
  firstName: string;
}

export function PlaceInQueue({ position, firstName }: Props) {
  return (
    <Card className="w-full flex items-center gap-2 p-4" variant="outlined">
      <Text weight="black" size="3xl">
        {position}
      </Text>
      <Text>
        {position === 1 ? "person is" : "people are"} ahead of you in{" "}
        {firstName}&apos;s queue.
      </Text>
    </Card>
  );
}
