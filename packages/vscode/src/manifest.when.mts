// See https://code.visualstudio.com/api/references/when-clause-contexts

const assetTreeFocused = 'view == bscotch-stitch-resources';
const hasProjects = 'stitch.projectCount > 0';
const hasOneProject = 'stitch.projectCount == 1';
const viewItemIsProject = 'viewItem == project';
const resourceIsGml = 'resourceExtname == .gml';

export const when = {
  assetTreeFocused,
  inspectorFocused: 'view == bscotch-stitch-inspector',
  editorFocused: 'editorFocus',
  hasProjects,
  hasOneProject,
  assetTreeFocusedAndHasOneProject: `${assetTreeFocused} && ${hasOneProject}`,
  assetTreeFocusedAndHasProjects: `${assetTreeFocused} && ${hasProjects}`,
  isInlineProject: `${assetTreeFocused} && ${hasProjects} && ${viewItemIsProject}`,
  resourceIsGml,
  viewItemIsFilter: 'viewItem =~ /^tree-filter-(enabled|disabled)/',
  viewItemIsFilterGroup: 'viewItem == tree-filter-group',
  viewItemIsFilterEnabled: 'viewItem == tree-filter-enabled',
  viewItemIsFilterDisabled: 'viewItem == tree-filter-disabled',
  viewItemIsProject,
  viewItemIsFolder: 'viewItem == folder',
  viewItemIsAsset: 'viewItem =~ /^asset-/',
  viewItemIsObject: 'viewItem == asset-objects',
  viewItemIsInspectorEvents: 'viewItem == inspector-object-events',
  viewItemIsInspectorParents: 'viewItem == inspector-object-parents',
} as const;
