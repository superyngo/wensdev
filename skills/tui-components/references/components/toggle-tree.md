# Toggle Tree

A list whose rows form a hierarchy; parent rows expand and collapse their children. Web terms
covered: Accordion, collapsible groups, file tree.

**Build or buy:** adopt `tui-tree-widget` (identifier-keyed `TreeState`, satisfies contracts C9)
for a static or user-browsed hierarchy. Self-write when the tree is **derived** from app data
each frame (herdr's worktree groups) or rows need custom multi-line rendering — then follow
the flatten model below.

## Model: tree → visible rows

The tree is never rendered directly. Each frame it is **flattened** into the visible rows given
the collapsed set; render, scrolling, and input all work on that flat list.

```rust
use std::collections::HashSet;
use std::hash::Hash;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TreeNode<Id> {
    pub id: Id,
    pub label: String,
    pub children: Vec<TreeNode<Id>>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VisibleRow<Id> {
    pub id: Id,
    pub depth: u16,
    pub has_children: bool,
    pub expanded: bool,
    /// Last sibling at its depth: draws `└` instead of `├`.
    pub last_child: bool,
    pub parent: Option<Id>,
}

/// Flatten `roots` honoring `collapsed`. A collapsed node still shows the child on the path to
/// `focused`, so the cursor can never be hidden inside a collapsed group.
pub fn visible_rows<Id: Clone + Eq + Hash>(
    roots: &[TreeNode<Id>],
    collapsed: &HashSet<Id>,
    focused: Option<&Id>,
) -> Vec<VisibleRow<Id>> {
    fn contains<Id: Eq>(node: &TreeNode<Id>, target: &Id) -> bool {
        &node.id == target || node.children.iter().any(|child| contains(child, target))
    }
    fn walk<Id: Clone + Eq + Hash>(
        nodes: &[TreeNode<Id>],
        depth: u16,
        parent: Option<&Id>,
        collapsed: &HashSet<Id>,
        focused: Option<&Id>,
        out: &mut Vec<VisibleRow<Id>>,
    ) {
        for (index, node) in nodes.iter().enumerate() {
            let has_children = !node.children.is_empty();
            let expanded = has_children && !collapsed.contains(&node.id);
            out.push(VisibleRow {
                id: node.id.clone(),
                depth,
                has_children,
                expanded,
                last_child: index + 1 == nodes.len(),
                parent: parent.cloned(),
            });
            if expanded {
                walk(&node.children, depth + 1, Some(&node.id), collapsed, focused, out);
            } else if let Some(path) = focused
                .and_then(|target| node.children.iter().find(|child| contains(child, target)))
            {
                walk(std::slice::from_ref(path), depth + 1, Some(&node.id), collapsed, focused, out);
            }
        }
    }
    let mut out = Vec::new();
    walk(roots, 0, None, collapsed, focused, &mut out);
    out
}
```

State: `collapsed: HashSet<Id>` (or `expanded`, pick one polarity per app and document the
default), `focused: Option<Id>`, `scroll: usize`. The cursor is an **id**, not a row index;
derive its row with `rows.iter().position(|row| row.id == focused)` after each flatten.

Default polarity: store `collapsed` when groups start expanded (herdr), `expanded` when a large
tree starts closed (file browsers). Unknown ids in the set are harmless and dropped on save.

## Rollup on collapsed parents

A collapsed parent summarizes what it hides: child count, and the most urgent child status
(error > attention > working > idle). Without it, collapsing hides alerts. herdr:
`displayed_workspace_status` takes the max-priority status over the group when collapsed.

## Render

- Indent `depth * 2` columns. Guides (`├ └ │`) are optional; if drawn, they come from
  `last_child` and the ancestors' `last_child`, computed in the flatten pass, never by
  looking at neighboring rows during render.
- Toggle glyph `▾` expanded / `▸` collapsed, in `accent`, on rows with children; leaves get a
  blank of the same width so labels align. ASCII fallback `v` / `>` (`wens-dev-principles ui 20`).
- The glyph cell is its own hit target ("toggle row id"); the rest of the row is "select row
  id" (contracts C2). herdr places the toggle at the row's right edge
  (`render_parent_group_toggle`); left of the label is the common default.
- Focus row: strong treatment (`ui 5`). Scroll with sticky cursor (`ui 7`).

## Input

| Event | On a collapsed parent | On an expanded parent | On a leaf |
|---|---|---|---|
| Right / `l` | Expand | Move to first child | Nothing |
| Left / `h` | Move to parent | Collapse | Move to parent |
| Space / Enter on the toggle | Expand | Collapse | Activate (Enter) |
| Up / Down / Home / End / PgUp / PgDn | Move over visible rows | ← | ← |
| `*` (optional) | Expand all descendants | ← | ← |
| Click on the toggle glyph | Expand | Collapse | — |
| Click on the row | Focus it | Focus it | Focus it |
| Double click on a parent row | Toggle | Toggle | Activate |

Collapsing the parent of the focused row moves focus to that parent (keyboard collapse), or —
when collapse comes from elsewhere (a click on another group's toggle, a reload) — keeps the
focused child visible under the collapsed parent per `visible_rows`.

## Edge cases

- Data reload reorders or removes nodes: collapsed and focused state follow ids (`ui 8`). If
  the focused id vanished, focus its former parent, else the row now at the same index, else
  the last row.
- Deep trees on narrow screens: cap indentation (e.g. at half the width) and truncate labels by
  display width (C7) instead of pushing labels off-screen.
- Cycles in source data: flatten from a DAG/tree only; guard with a visited set if the source
  is a graph.
- Thousands of rows: flatten is O(n) per frame; render only the visible slice.

## Acceptance

- [ ] Collapsing and expanding round-trips to the same visible rows.
- [ ] Collapsing a group from the mouse while a child is focused keeps that child visible.
- [ ] Left on a child focuses the parent; Left again collapses it.
- [ ] Reloading with the same ids in a different order preserves collapsed groups.
- [ ] The persisted collapsed set is sorted and contains ids, not indices.
- [ ] A collapsed parent shows the most urgent child status.
- [ ] Clicking the glyph toggles; clicking the label only focuses.

## Reference

herdr `workspace_entries`, `displayed_workspace_status`, `render_parent_group_toggle` in
`src/client/shell/sidebar.rs`; persisted `collapsed_groups` in
`src/client/shell/preferences.rs` `ClientChromePreferences`. Crate: `tui-tree-widget`.
