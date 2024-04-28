如果您想创建一个 `filterTableData` 方法，该方法能够搜索并过滤包含嵌套子节点的树形数据结构，我们可以采用递归方式实现。这种方法将允许您检查每个节点以及其所有子节点是否匹配搜索条件，如果节点或其任一子节点匹配，该节点将被包含在过滤结果中。

以下是如何实现这种递归搜索的详细步骤和代码示例：

### 1. 定义搜索函数

我们需要定义一个递归函数，该函数遍历节点及其所有子节点，检查是否满足给定的搜索条件。如果一个节点或其任一子节点满足搜索条件，该节点将被包括在结果中。

### Vue 组件代码示例

这里是如何在 Vue 组件中实现这个递归搜索功能的例子：

```vue
<script setup>
import { ref } from 'vue';

interface User {
  id: number;
  date: string;
  name: string;
  address: string;
  children?: User[];
}

const originalData = ref<User[]>([
  {
    id: 1,
    date: '2020-01-01',
    name: 'Alice',
    address: 'Street 1',
    children: [
      {
        id: 11,
        date: '2020-01-02',
        name: 'Bob',
        address: 'Street 2'
      },
      {
        id: 12,
        date: '2020-01-03',
        name: 'Charlie',
        address: 'Street 3',
        children: [
          {
            id: 121,
            date: '2020-01-04',
            name: 'Dave',
            address: 'Street 4'
          }
        ]
      }
    ]
  }
]);

const filterTableData = (searchQuery) => {
  const results = [];
  
  function search(node) {
    // Copy node without children to avoid mutating original data
    let nodeCopy = { ...node, children: undefined };
    let foundInChild = false;

    if (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      // Node matches the search criteria
      nodeCopy = { ...node }; // Copy again with children to include them in results
    }

    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children.map(child => search(child)).filter(child => child);
      if (filteredChildren.length > 0) {
        foundInChild = true;
        nodeCopy.children = filteredChildren;
      }
    }

    return (foundInChild || nodeCopy.name || nodeCopy.address) ? nodeCopy : null;
  }

  originalData.value.forEach(item => {
    const result = search(item);
    if (result) {
      results.push(result);
    }
  });

  return results;
};
</script>
```

### 使用示例

在模板或方法中，您可以调用 `filterTableData` 方法并传递搜索查询字符串，例如：

```javascript
const filteredResults = filterTableData('alice');
console.log(filteredResults);
```

### 解释

- **递归搜索**: `search` 函数递归地检查每个节点是否匹配搜索条件，并且递归地检查其所有子节点。
- **条件检查**: 如果当前节点或其任何子节点匹配搜索条件，当前节点会被包含在结果中。
- **结果构建**: 如果一个节点匹配或其子节点中有匹配的，那么这个节点会被保留在结果数组中，并包含其符合条件的子节点。

这种方法允许您在具有复杂嵌套结构的数据集中进行深度搜索，确保能够找到所有相关的条目。