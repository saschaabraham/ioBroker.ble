// tslint:disable:no-unused-expression
// tslint:disable:no-console

import { assert, expect, should } from "chai";
// enable the should interface with sinon
should();

import { XiaomiAdvertisement } from "./xiaomi_protocol";

type OperationModes =
	"mi-flora-normal"
	| "mi-flora-uninitialized"
	;
function assertFlags(operationMode: OperationModes, parsed: XiaomiAdvertisement) {
	if (operationMode === "mi-flora-normal") {
		parsed.isNewFactory.should.be.true;
		parsed.isConnected.should.be.false;
		parsed.isCentral.should.be.false;
		parsed.isEncrypted.should.be.false;
		parsed.hasMacAddress.should.be.true;
		parsed.hasCapabilities.should.be.true;
		parsed.hasEvent.should.be.true;
		parsed.hasCustomData.should.be.false;
		parsed.hasSubtitle.should.be.false;
		parsed.isBindingFrame.should.be.false;
	} else if (operationMode === "mi-flora-uninitialized") {
		parsed.isNewFactory.should.be.true;
		parsed.isConnected.should.be.false;
		parsed.isCentral.should.be.false;
		parsed.isEncrypted.should.be.false;
		parsed.hasMacAddress.should.be.true;
		parsed.hasCapabilities.should.be.true;
		parsed.hasEvent.should.be.false;
		parsed.hasCustomData.should.be.false;
		parsed.hasSubtitle.should.be.false;
		parsed.isBindingFrame.should.be.true;
	}
}

function assertVersion(actual: number, expected: number) {
	actual.should.equal(expected, "the version was wrong");
}
function assertProductID(actual: number, expected: number) {
	actual.should.equal(expected, "the product id was wrong");
}
function assertFrameCounter(actual: number, expected: number) {
	actual.should.equal(expected, "the frame counter was wrong");
}
function assertMacAddress(actual: string, expected: string) {
	actual.should.equal(expected, "the mac address was wrong");
}
function assertCapabilities(actual: number, expected: number) {
	actual.should.equal(expected, "the capabilities were wrong");
}

describe("xiaomi protocol => ", () => {
	describe("packets should be parsed correctly => ", () => {

		it("incomplete packet", () => {
			function create(hex: string) {
				return new XiaomiAdvertisement(Buffer.from(hex, "hex"));
			}
			expect(() => create("00")).to.throw("5 bytes");
			expect(() => create("0011")).to.throw("5 bytes");
			expect(() => create("001122")).to.throw("5 bytes");
			expect(() => create("00112233")).to.throw("5 bytes");
			expect(() => create("")).to.throw("5 bytes");
		});

		it("Mi-Flora: Temperature", () => {
			const frame = Buffer.from("71209800da795d658d7cc40d0410021201", "hex");
			const parsed = new XiaomiAdvertisement(frame);

			assertFlags("mi-flora-normal", parsed);
			assertVersion(parsed.version, 2);
			assertProductID(parsed.productID, 0x0098);
			assertFrameCounter(parsed.frameCounter, 0xda);
			assertMacAddress(parsed.macAddress, "c47c8d655d79");
			assertCapabilities(parsed.capabilities, 0x0d);
			parsed.event.should.deep.equal({
				temperature: 0x112 / 10,
			});
		});

		it("Mi-Flora: Fertility", () => {
			const frame = Buffer.from("71209800d9795d658d7cc40d0910022e00", "hex");
			const parsed = new XiaomiAdvertisement(frame);

			assertFlags("mi-flora-normal", parsed);
			assertVersion(parsed.version, 2);
			assertProductID(parsed.productID, 0x0098);
			assertFrameCounter(parsed.frameCounter, 0xd9);
			assertMacAddress(parsed.macAddress, "c47c8d655d79");
			assertCapabilities(parsed.capabilities, 0x0d);
			parsed.event.should.deep.equal({
				fertility: 0x2e,
			});
		});

		it("Mi-Flora: Moisture", () => {
			const frame = Buffer.from("71209800d8795d658d7cc40d0810010d", "hex");
			const parsed = new XiaomiAdvertisement(frame);

			assertFlags("mi-flora-normal", parsed);
			assertVersion(parsed.version, 2);
			assertProductID(parsed.productID, 0x0098);
			assertFrameCounter(parsed.frameCounter, 0xd8);
			assertMacAddress(parsed.macAddress, "c47c8d655d79");
			assertCapabilities(parsed.capabilities, 0x0d);
			parsed.event.should.deep.equal({
				moisture: 0x0d,
			});
		});

		it("Mi-Flora: Illuminance", () => {
			const frame = Buffer.from("71209800ef795d658d7cc40d071003fe4c00", "hex");
			const parsed = new XiaomiAdvertisement(frame);

			assertFlags("mi-flora-normal", parsed);
			assertVersion(parsed.version, 2);
			assertProductID(parsed.productID, 0x0098);
			assertFrameCounter(parsed.frameCounter, 0xef);
			assertMacAddress(parsed.macAddress, "c47c8d655d79");
			assertCapabilities(parsed.capabilities, 0x0d);
			parsed.event.should.deep.equal({
				illuminance: 0x4cfe,
			});
		});

		it("Mi-Flora: un-initialized", () => {
			const frame = Buffer.from("3102980006dab4618d7cc40d", "hex");
			const parsed = new XiaomiAdvertisement(frame);

			assertFlags("mi-flora-uninitialized", parsed);
			assertVersion(parsed.version, 0);
			assertProductID(parsed.productID, 0x0098);
			assertFrameCounter(parsed.frameCounter, 0x06);
			assertMacAddress(parsed.macAddress, "c47c8d61b4da");
			assertCapabilities(parsed.capabilities, 0x0d);
			expect(parsed.event).to.be.undefined;
		});
	});
});

// temperature should be 27.4
// 71209800da795d658d7cc40d0410021201

// fertility should be 46
// 71209800 d9 795d658d7cc40d0910022e00

// moisture should be 13
// 71209800d8795d658d7cc40d0810010d

// illuminance should be 19710
// 71209800ef795d658d7cc40d071003fe4c00

// should be un-initialized
// 3102980006dab4618d7cc40d