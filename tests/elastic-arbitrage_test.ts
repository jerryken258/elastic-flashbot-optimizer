import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure elastic-arbitrage contract initialization works",
    async fn(chain, accounts) {
        const deployer = accounts.get('deployer')!;
        const alice = accounts.get('wallet_1')!;
        
        const block = chain.mineBlock([
            Tx.contractCall('elastic-arbitrage', 'register-arbitrage-strategy', 
                [types.principal(alice.address), types.uint(10000)], 
                deployer.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Prevent unauthorized strategy registration",
    async fn(chain, accounts) {
        const alice = accounts.get('wallet_1')!;
        
        const block = chain.mineBlock([
            Tx.contractCall('elastic-arbitrage', 'register-arbitrage-strategy', 
                [types.principal(alice.address), types.uint(10000)], 
                alice.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectErr().expectUint(200);  // ERR-NOT-AUTHORIZED
    }
});

Clarinet.test({
    name: "Execute arbitrage strategy successfully",
    async fn(chain, accounts) {
        const deployer = accounts.get('deployer')!;
        const alice = accounts.get('wallet_1')!;
        
        // Register strategy
        chain.mineBlock([
            Tx.contractCall('elastic-arbitrage', 'register-arbitrage-strategy', 
                [types.principal(alice.address), types.uint(10000)], 
                deployer.address)
        ]);

        // Execute arbitrage
        const block = chain.mineBlock([
            Tx.contractCall('elastic-arbitrage', 'execute-arbitrage', 
                [types.uint(5000), types.uint(5250)], 
                alice.address)
        ]);

        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk();
    }
});