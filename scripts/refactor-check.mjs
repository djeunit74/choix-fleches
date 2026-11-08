// Le contrat actif est le moteur audité ; les anciens libellés de version ne prouvent pas la justesse des données.
import { execFileSync } from 'node:child_process';
execFileSync(process.execPath,['--test','scripts/verified-check.test.cjs','scripts/release-check.test.cjs'],{stdio:'inherit'});
