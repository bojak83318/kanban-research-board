(async () => {
  const { parseCSV, PRIORITY_KEYWORDS } = await import('./csvParsing.js');

  const TEST_CSV = `Repo Name,URL,Stars,Days Since Update,Primary Language,Category,Brief Description
proxy-tool,https://example.com/proxy-tool,10,1,JavaScript,Proxy,Fast proxy rotation tool
normal-tool,https://example.com/normal-tool,5,3,Python,Utility,Just a helper
account-manager,https://example.com/account-manager,20,2,TypeScript,Manager,Account switching for users
quoted-desc,https://example.com/quoted-desc,15,4,Go,Tool,"Handles auth, switch, and rotation"`;

  const items = parseCSV(TEST_CSV);
  const priorityItems = items.filter(item => item.isPriority).map(item => item.name);
  const nonPriorityItems = items.filter(item => !item.isPriority).map(item => item.name);

  console.log('PRIORITY_KEYWORDS:', PRIORITY_KEYWORDS.join(', '));
  console.log('Total items:', items.length);
  console.log('Priority items:', priorityItems);
  console.log('Non-priority items:', nonPriorityItems);
  console.log(
    'Sorted by priority then stars:',
    items.map(item => `${item.name}:${item.stars}:${item.isPriority}`)
  );
})();
