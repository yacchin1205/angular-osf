import { ResourceType } from '@osf/shared/enums/resource-type.enum';

import { CedarEditorContext, CedarEditorTargetType } from '../models';

const targetTypes = new Map<ResourceType, CedarEditorTargetType>([
  [ResourceType.File, 'files'],
  [ResourceType.Project, 'nodes'],
  [ResourceType.Registration, 'registrations'],
]);

export function createCedarEditorContext(
  resourceId: string,
  resourceType: ResourceType,
  apiDomainUrl: string
): CedarEditorContext {
  if (!resourceId) throw new Error('CEDAR editor context requires a resource ID');

  const targetType = targetTypes.get(resourceType);
  if (!targetType) throw new Error(`Unsupported CEDAR metadata resource type: ${resourceType}`);

  return {
    target: { id: resourceId, type: targetType },
    apiDomainUrl,
  };
}
