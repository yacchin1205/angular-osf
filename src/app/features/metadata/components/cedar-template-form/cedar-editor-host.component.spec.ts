import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CedarEditorElement } from '../../models';

import { CedarEditorHostComponent } from './cedar-editor-host.component';

import { OSFTestingModule } from '@testing/osf.testing.module';

describe('CedarEditorHostComponent', () => {
  let fixture: ComponentFixture<CedarEditorHostComponent>;
  let component: CedarEditorHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CedarEditorHostComponent, OSFTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CedarEditorHostComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', { showHeader: false });
    fixture.componentRef.setInput('context', {
      target: { id: 'resource-1', type: 'nodes' },
      apiDomainUrl: 'https://api.example.com',
    });
    fixture.componentRef.setInput('templateObject', { title: 'PoC template' });
    fixture.componentRef.setInput('metadata', { value: 'initial' });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('uses the built-in editor when no external editor is configured', () => {
    const editor = fixture.nativeElement.querySelector('cedar-embeddable-editor') as CedarEditorElement;

    expect(editor).toBeTruthy();
    expect(editor.config).toEqual({ showHeader: false });
    expect(editor.context).toEqual({
      target: { id: 'resource-1', type: 'nodes' },
      apiDomainUrl: 'https://api.example.com',
    });
    expect(editor.templateObject).toEqual({ title: 'PoC template' });
    expect(editor.metadata).toEqual({ value: 'initial' });
  });

  it('forwards the editor contract and change events', () => {
    const editor = fixture.nativeElement.querySelector('cedar-embeddable-editor') as CedarEditorElement;
    const emitted = jest.fn();
    component.editorChange.subscribe(emitted);

    editor.currentMetadata = { value: 'updated' };
    editor.dataQualityReport = { isValid: true };
    editor.dispatchEvent(new Event('change'));

    expect(component.currentMetadata).toEqual({ value: 'updated' });
    expect(component.dataQualityReport).toEqual({ isValid: true });
    expect(emitted).toHaveBeenCalledTimes(1);
  });
});
