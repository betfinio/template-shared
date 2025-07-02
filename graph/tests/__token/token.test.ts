import { assert, describe, test, beforeEach, clearStore } from "matchstick-as/assembly/index";
import { Address, ethereum, BigInt } from "@graphprotocol/graph-ts";
import { handleTransfer } from "../../src/token";
import { createTransferEvent } from "./mock-events";

describe("Token Transfer Handler", () => {
  beforeEach(() => {
    clearStore();
  });

  test("Should create Example entity on Transfer event", () => {
    // Arrange
    const fromAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    const toAddress = Address.fromString("0x0000000000000000000000000000000000000002");
    const transferValue = BigInt.fromI32(1000);

    const transferEvent = createTransferEvent(fromAddress, toAddress, transferValue);

    // Act
    handleTransfer(transferEvent);

    // Assert
    const entityId = fromAddress.toHexString();
    assert.entityCount("Example", 1);
    assert.fieldEquals("Example", entityId, "id", entityId);
    assert.fieldEquals("Example", entityId, "data", transferValue.toString());
  });

  test("Should handle multiple Transfer events from same address", () => {
    // Arrange
    const fromAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    const toAddress1 = Address.fromString("0x0000000000000000000000000000000000000002");
    const toAddress2 = Address.fromString("0x0000000000000000000000000000000000000003");
    const transferValue1 = BigInt.fromI32(1000);
    const transferValue2 = BigInt.fromI32(2000);

    const transferEvent1 = createTransferEvent(fromAddress, toAddress1, transferValue1);
    const transferEvent2 = createTransferEvent(fromAddress, toAddress2, transferValue2);

    // Act
    handleTransfer(transferEvent1);
    handleTransfer(transferEvent2);

    // Assert
    const entityId = fromAddress.toHexString();
    assert.entityCount("Example", 1); // Should only have one entity per address
    assert.fieldEquals("Example", entityId, "id", entityId);
    assert.fieldEquals("Example", entityId, "data", transferValue2.toString()); // Should be overwritten with latest value
  });

  test("Should handle Transfer events from different addresses", () => {
    // Arrange
    const fromAddress1 = Address.fromString("0x0000000000000000000000000000000000000001");
    const fromAddress2 = Address.fromString("0x0000000000000000000000000000000000000002");
    const toAddress = Address.fromString("0x0000000000000000000000000000000000000003");
    const transferValue1 = BigInt.fromI32(1000);
    const transferValue2 = BigInt.fromI32(2000);

    const transferEvent1 = createTransferEvent(fromAddress1, toAddress, transferValue1);
    const transferEvent2 = createTransferEvent(fromAddress2, toAddress, transferValue2);

    // Act
    handleTransfer(transferEvent1);
    handleTransfer(transferEvent2);

    // Assert
    assert.entityCount("Example", 2);

    const entityId1 = fromAddress1.toHexString();
    const entityId2 = fromAddress2.toHexString();

    assert.fieldEquals("Example", entityId1, "id", entityId1);
    assert.fieldEquals("Example", entityId1, "data", transferValue1.toString());

    assert.fieldEquals("Example", entityId2, "id", entityId2);
    assert.fieldEquals("Example", entityId2, "data", transferValue2.toString());
  });

  test("Should handle zero value transfers", () => {
    // Arrange
    const fromAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    const toAddress = Address.fromString("0x0000000000000000000000000000000000000002");
    const transferValue = BigInt.fromI32(0);

    const transferEvent = createTransferEvent(fromAddress, toAddress, transferValue);

    // Act
    handleTransfer(transferEvent);

    // Assert
    const entityId = fromAddress.toHexString();
    assert.entityCount("Example", 1);
    assert.fieldEquals("Example", entityId, "id", entityId);
    assert.fieldEquals("Example", entityId, "data", transferValue.toString());
  });

  test("Should handle large transfer values", () => {
    // Arrange
    const fromAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    const toAddress = Address.fromString("0x0000000000000000000000000000000000000002");
    const transferValue = BigInt.fromString("1000000000000000000000000"); // 1 million tokens with 18 decimals

    const transferEvent = createTransferEvent(fromAddress, toAddress, transferValue);

    // Act
    handleTransfer(transferEvent);

    // Assert
    const entityId = fromAddress.toHexString();
    assert.entityCount("Example", 1);
    assert.fieldEquals("Example", entityId, "id", entityId);
    assert.fieldEquals("Example", entityId, "data", transferValue.toString());
  });

  test("Should handle transfer from zero address (mint)", () => {
    // Arrange
    const fromAddress = Address.fromString("0x0000000000000000000000000000000000000000");
    const toAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    const transferValue = BigInt.fromI32(1000);

    const transferEvent = createTransferEvent(fromAddress, toAddress, transferValue);

    // Act
    handleTransfer(transferEvent);

    // Assert
    const entityId = fromAddress.toHexString();
    assert.entityCount("Example", 1);
    assert.fieldEquals("Example", entityId, "id", entityId);
    assert.fieldEquals("Example", entityId, "data", transferValue.toString());
  });

  test("Should handle transfer to zero address (burn)", () => {
    // Arrange
    const fromAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    const toAddress = Address.fromString("0x0000000000000000000000000000000000000000");
    const transferValue = BigInt.fromI32(1000);

    const transferEvent = createTransferEvent(fromAddress, toAddress, transferValue);

    // Act
    handleTransfer(transferEvent);

    // Assert
    const entityId = fromAddress.toHexString();
    assert.entityCount("Example", 1);
    assert.fieldEquals("Example", entityId, "id", entityId);
    assert.fieldEquals("Example", entityId, "data", transferValue.toString());
  });

  test("Should handle self-transfer", () => {
    // Arrange
    const address = Address.fromString("0x0000000000000000000000000000000000000001");
    const transferValue = BigInt.fromI32(1000);

    const transferEvent = createTransferEvent(address, address, transferValue);

    // Act
    handleTransfer(transferEvent);

    // Assert
    const entityId = address.toHexString();
    assert.entityCount("Example", 1);
    assert.fieldEquals("Example", entityId, "id", entityId);
    assert.fieldEquals("Example", entityId, "data", transferValue.toString());
  });

  test("Should handle multiple events in sequence", () => {
    // Arrange
    const addresses = [
      Address.fromString("0x0000000000000000000000000000000000000001"),
      Address.fromString("0x0000000000000000000000000000000000000002"),
      Address.fromString("0x0000000000000000000000000000000000000003"),
      Address.fromString("0x0000000000000000000000000000000000000004"),
      Address.fromString("0x0000000000000000000000000000000000000005")
    ];

    const toAddress = Address.fromString("0x0000000000000000000000000000000000000006");

    // Act
    for (let i = 0; i < addresses.length; i++) {
      const transferValue = BigInt.fromI32((i + 1) * 1000);
      const transferEvent = createTransferEvent(addresses[i], toAddress, transferValue);
      handleTransfer(transferEvent);
    }

    // Assert
    assert.entityCount("Example", addresses.length);

    for (let i = 0; i < addresses.length; i++) {
      const entityId = addresses[i].toHexString();
      const expectedValue = BigInt.fromI32((i + 1) * 1000).toString();
      assert.fieldEquals("Example", entityId, "id", entityId);
      assert.fieldEquals("Example", entityId, "data", expectedValue);
    }
  });
});

