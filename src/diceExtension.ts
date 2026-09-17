import OBR from "@owlbear-rodeo/sdk";
import { evaluateRollExpression } from "./rollExpression";

export const DICE_EXTENSION_KEY = "com.ex-asperis.dwtools/dice-extension";
export type DiceExtension = "dwtools" | "no-dice";
const REQUEST = "com.ex-asperis.no-dice/api/request";
const RESPONSE = "com.ex-asperis.no-dice/api/response";

export function selectedDiceExtension(
  metadata: Record<string, unknown>,
): DiceExtension {
  return metadata[DICE_EXTENSION_KEY] === "no-dice" ? "no-dice" : "dwtools";
}

export function toNoDiceExpression(source: string): string {
  return source
    .replace(/\b(?:best|highest|b|h)\s*\[/gi, "H[")
    .replace(/\b(?:worst|lowest|w|l)\s*\[/gi, "L[");
}

export function symbolicChoiceExpression(choices: readonly string[]): string {
  if (
    choices.length < 1 ||
    choices.length > 1000 ||
    choices.some((choice) => !choice.trim())
  )
    throw new Error(
      "Treasure tables must have between 1 and 1,000 nonempty choices.",
    );
  if (choices.some((choice) => /[,{}]/.test(choice)))
    throw new Error(
      "No Dice cannot roll treasure entries containing commas or braces as symbolic faces.",
    );
  return `d{${choices.map((choice) => choice.trim()).join(",")}}`;
}

export async function rollWithSelectedExtension(
  source: string,
): Promise<number | string | undefined> {
  try {
    const extension = selectedDiceExtension(await OBR.room.getMetadata());
    if (extension === "dwtools") {
      const result = evaluateRollExpression(source);
      await OBR.notification.show(
        result.message,
        result.ok ? "SUCCESS" : "ERROR",
      );
      return result.ok && result.kind !== "list" ? result.value : undefined;
    }
    const requestId = crypto.randomUUID();
    return await new Promise<number | string | undefined>((resolve, reject) => {
      let settled = false;
      let unsubscribe = () => {};
      const finish = (error?: Error, value?: number | string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        unsubscribe();
        if (error) reject(error);
        else resolve(value);
      };
      unsubscribe = OBR.broadcast.onMessage(RESPONSE, (event) => {
        const response = event.data as Record<string, unknown> | null;
        if (
          response?.protocolVersion !== 1 ||
          response.type !== "rollResult" ||
          response.requestId !== requestId
        )
          return;
        if (response.ok === false) {
          const error = response.error as { message?: string } | undefined;
          finish(new Error(error?.message ?? "No Dice could not roll."));
        } else if (response.ok === true) {
          const result = response.result as
            { kind?: string; value?: unknown } | undefined;
          finish(
            undefined,
            typeof result?.value === "number" ||
              typeof result?.value === "string"
              ? result.value
              : undefined,
          );
        }
      });
      const timer = setTimeout(
        () =>
          finish(
            new Error(
              "No Dice did not respond. Check that it is installed and enabled.",
            ),
          ),
        3000,
      );
      void OBR.broadcast
        .sendMessage(
          REQUEST,
          {
            protocolVersion: 1,
            type: "roll",
            requestId,
            expression: toNoDiceExpression(source),
            options: { label: "DWTools" },
          },
          { destination: "LOCAL" },
        )
        .catch((error: unknown) =>
          finish(
            error instanceof Error
              ? error
              : new Error("Could not contact No Dice."),
          ),
        );
    });
  } catch (error) {
    await OBR.notification.show(
      error instanceof Error ? error.message : "Dice roll failed.",
      "ERROR",
    );
  }
}
