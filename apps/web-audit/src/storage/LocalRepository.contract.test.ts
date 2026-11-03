import { LocalRepository } from './LocalRepository';
import { runRepositoryContract } from './repositoryContract';

let n = 0;
runRepositoryContract('LocalRepository', () => new LocalRepository(`trading-lab-contract-${++n}`));
