import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CreatePostRequest } from '../../core/models/post';
import { NgIconComponent } from "@ng-icons/core";

export interface PostFormSubmitEvent {
  request: CreatePostRequest;
  files: File[];
}

export interface PostFormInitialValues {
  title: string;
  content: string;
  published: boolean;
  mediaUrls?: string[];
}

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIconComponent],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostFormComponent implements OnInit {
  @Input() initialValues: PostFormInitialValues | null = null;
  @Input() submitLabel = 'Create Post';
  @Input() submitting = false;

  @Output() submitCreate = new EventEmitter<PostFormSubmitEvent>();
  @Output() submitUpdate = new EventEmitter<PostFormSubmitEvent>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  private readonly MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

  readonly form: FormGroup = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
    published: [false],
    mediaUrls: [[] as string[]]
  });

  selectedFiles: File[] = [];
  existingMediaUrls: string[] = [];

  get titleRemaining(): number {
    return 255 - (this.form.controls['title'].value?.length ?? 0);
  }

  get contentRemaining(): number {
    return 5000 - (this.form.controls['content'].value?.length ?? 0);
  }

  get isEditMode(): boolean {
    return this.initialValues !== null;
  }

  ngOnInit(): void {
    if (this.initialValues) {
      this.form.patchValue({
        title: this.initialValues.title,
        content: this.initialValues.content,
        published: this.initialValues.published,
        mediaUrls: this.initialValues.mediaUrls ?? []
      });
      this.existingMediaUrls = [...(this.initialValues.mediaUrls ?? [])];
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const oversized: string[] = [];
    const valid: File[] = [];

    for (const file of files) {
      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        oversized.push(file.name);
      } else {
        valid.push(file);
      }
    }

    if (oversized.length > 0) {
      window.alert(`The following files exceed the 50MB limit:\n${oversized.join('\n')}`);
    }

    if (valid.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...valid];
    }

    input.value = '';
  }

  onRemoveFile(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  onRemoveExistingMedia(index: number): void {
    this.existingMediaUrls = this.existingMediaUrls.filter((_, i) => i !== index);
    this.form.patchValue({ mediaUrls: this.existingMediaUrls });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;

    const rawValue = this.form.getRawValue();
    const request: CreatePostRequest = {
      title: rawValue.title.trim(),
      content: rawValue.content.trim(),
      published: rawValue.published,
      mediaUrls: this.existingMediaUrls.length > 0 ? this.existingMediaUrls : undefined
    };

    const event: PostFormSubmitEvent = {
      request,
      files: this.selectedFiles
    };

    if (this.isEditMode) {
      this.submitUpdate.emit(event);
    } else {
      this.submitCreate.emit(event);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  onCancelClick(): void {
    this.cancelled.emit();
  }
}
