import { ResourceType } from '@osf/shared/enums/resource-type.enum';

import { createCedarEditorContext } from './cedar-editor-context.helper';

describe('createCedarEditorContext', () => {
  it.each([
    [ResourceType.File, 'files'],
    [ResourceType.Project, 'nodes'],
    [ResourceType.Registration, 'registrations'],
  ] as const)('maps resource type %s to %s', (resourceType, targetType) => {
    expect(createCedarEditorContext('resource-1', resourceType, 'https://api.example.com')).toEqual({
      target: { id: 'resource-1', type: targetType },
      apiDomainUrl: 'https://api.example.com',
    });
  });

  it('rejects unsupported resource types', () => {
    expect(() => createCedarEditorContext('resource-1', ResourceType.Preprint, 'https://api.example.com')).toThrow(
      'Unsupported CEDAR metadata resource type'
    );
  });

  it('requires a resource ID', () => {
    expect(() => createCedarEditorContext('', ResourceType.Project, 'https://api.example.com')).toThrow(
      'CEDAR editor context requires a resource ID'
    );
  });
});
