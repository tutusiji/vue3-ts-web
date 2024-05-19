父节点的 `indeterminate` 属性应当反映子节点的选中状态，我们需要增加额外的逻辑来维护和更新 `indeterminate` 状态。这通常涉及到在更新父节点时，检查所有子节点的状态，并据此更新父节点的 `checked` 和 `indeterminate` 属性。

以下是一个更新的逻辑，它包括：
1. 当所有子节点都被选中时，设置父节点的 `checked` 为 `true`，并将 `indeterminate` 设置为 `false`。
2. 当至少一个（但不是全部）子节点被选中时，设置父节点的 `checked` 为 `false`，并将 `indeterminate` 设置为 `true`。
3. 当没有子节点被选中时，设置父节点的 `checked` 和 `indeterminate` 均为 `false`。

以下是函数的实现：

```javascript
function updateParentChecked(currentItem, allData) {
  const parentItem = findParent(currentItem, allData);
  if (parentItem && parentItem.children) {
    // 检查所有子节点的选中状态
    const checkedChildrenCount = parentItem.children.filter(child => child.checked).length;
    const indeterminateChildrenCount = parentItem.children.filter(child => child.indeterminate).length;

    if (checkedChildrenCount === parentItem.children.length) {
      // 所有子节点都被选中
      parentItem.checked = true;
      parentItem.indeterminate = false;
    } else if (checkedChildrenCount > 0 || indeterminateChildrenCount > 0) {
      // 至少一个子节点被选中，或者至少一个子节点处于不确定状态
      parentItem.checked = false;
      parentItem.indeterminate = true;
    } else {
      // 没有子节点被选中
      parentItem.checked = false;
      parentItem.indeterminate = false;
    }

    // 递归更新更高级别的父节点
    updateParentChecked(parentItem, allData);
  }
}

// 递归查找父节点
function findParent(childItem, allData) {
  return allData.find(item => item.children && item.children.some(child => child.id === childItem.id));
}
```

### 调用这个函数
确保在每次复选框状态改变时调用 `updateParentChecked` 函数。例如，当您修改某个子节点的 `checked` 状态时，应立即更新其父节点的状态。这通常发生在复选框的 `change` 事件处理函数中：

```javascript
function checkboxChanged(item, allData) {
  // 直接更新子节点的状态
  const toggleChildrenChecked = (children, checked) => {
    children.forEach(child => {
      child.checked = checked;
      child.indeterminate = false; // 重置不确定状态
      if (child.children) {
        toggleChildrenChecked(child.children, checked);
      }
    });
  };

  toggleChildrenChecked(item.children, item.checked);
  updateParentChecked(item, allData);
}
```

确保在 `data` 或 `setup` 中维护全局数据状态，以便可以访问和更新整个数据树。这需要 `allData` 被正确传递到每个相关函数，或通过 Vue 的响应式系统维护数据状态。