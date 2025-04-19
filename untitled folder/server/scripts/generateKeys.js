import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRandomKeys } from 'paillier-bigint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  // ✅ generate with secret key parts
  const { publicKey, privateKey } = await generateRandomKeys(2048, true);

  // ✅ Manually extract all fields including `p` and `q`
  const { lambda, mu, p, q } = privateKey;

  const dir = path.resolve(__dirname, '../keys');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Save public key
  fs.writeFileSync(path.join(dir, 'public.json'), JSON.stringify({
    n: publicKey.n.toString(),
    g: publicKey.g.toString()
  }, null, 2));

  // Save private key with p & q
  fs.writeFileSync(path.join(dir, 'private.json'), JSON.stringify({
    lambda: lambda.toString(),
    mu: mu.toString(),
    p: p?.toString() ?? null,
    q: q?.toString() ?? null
  }, null, 2));

  if (p && q) {
    console.log('✅ Keypair generated with p & q!');
  } else {
    console.warn('⚠️ Still missing p or q');
  }
})();
