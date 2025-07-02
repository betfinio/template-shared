import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../../generated/Template/Token";
import { newMockEvent } from "matchstick-as/assembly/index";


export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let event = changetype<Transfer>(newMockEvent());
  event.parameters = [];
  event.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(from)));
  event.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(to)));
  event.parameters.push(new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value)));
  return event;
} 