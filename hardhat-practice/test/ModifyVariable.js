const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("ModifyVariable", function () {
    async function deployModifyVariableFixture() {
        const initialX = 10;

        const [owner, otherAccount] = await ethers.getSigners();

        const ModifyVariable = await ethers.getContractFactory("ModifyVariable");
        const modifyVariable = await ModifyVariable.deploy(initialX);

        // Wait for the contract to be deployed
        await modifyVariable.deployTransaction;

        return { modifyVariable, initialX, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right initial value of x", async function () {
            const { modifyVariable, initialX } = await loadFixture(deployModifyVariableFixture);

            expect(await modifyVariable.x()).to.equal(initialX);
        });
    });

    describe("Modify x", function () {
        it("Should change x to 1337", async function () {
            const { modifyVariable } = await loadFixture(deployModifyVariableFixture);

            await modifyVariable.modifyToLeet();
            const newX = await modifyVariable.x();
            expect(newX).to.equal(1337);
        });
    });
});