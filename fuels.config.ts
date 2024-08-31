import { createConfig } from 'fuels';

export default createConfig({
  scripts: [
        'gasless_predicate',
  ],
  predicates: [
    'gasless_wallet'
  ],
  output: './src/predicates',
});

/**
 * Check the docs:
 * https://docs.fuel.network/docs/fuels-ts/fuels-cli/config-file/
 */
