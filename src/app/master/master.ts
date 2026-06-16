import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../pages/shareServices/master-service';
import { Category, Role } from '../pages/Interfaces/LoginUser';

type TabKey = 'roles' | 'categories';

@Component({
  selector: 'app-master',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './master.html',
  styleUrl: './master.css',
})
export class Master implements OnInit {

  private fb = inject(FormBuilder);
  private masterSer = inject(MasterService);

  activeTab = signal<TabKey>('roles');

  roleForm: FormGroup;
  categoryForm: FormGroup;

  rolesList = signal<Role[]>([]);
  categoriesList = signal<Category[]>([]);

  roleSearch = signal('');
  categorySearch = signal('');

  filteredRoles = computed(() => {
    const term = this.roleSearch().trim().toLowerCase();
    if (!term) return this.rolesList();
    return this.rolesList().filter(r => r.roleName?.toLowerCase().includes(term));
  });

  filteredCategories = computed(() => {
    const term = this.categorySearch().trim().toLowerCase();
    if (!term) return this.categoriesList();
    return this.categoriesList().filter(c => c.name?.toLowerCase().includes(term));
  });

  constructor() {
    this.roleForm = this.fb.group({
      roleId: [0],
      roleName: ['', [Validators.required, Validators.minLength(2)]],
    });

    this.categoryForm = this.fb.group({
      categoryId: [0],
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit() {
    this.loadRoles();
    this.loadCategories();
  }

  switchTab(tab: TabKey) {
    this.activeTab.set(tab);
  }

  loadRoles() {
    this.masterSer.getRolesList().subscribe({
      next: (res: any) => this.rolesList.set(res?.data ?? []),
      error: () => this.rolesList.set([]),
    });
  }

  loadCategories() {
    this.masterSer.getCategoriesList().subscribe({
      next: (res: any) => this.categoriesList.set(res?.data ?? []),
      error: () => this.categoriesList.set([]),
    });
  }

  saveRole() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    const payload = this.roleForm.value
    if (payload.roleId > 0) {
      this.masterSer.updateRole(payload.roleId, payload).subscribe({
        next: () => {
          alert('Role updated successfully');
          this.resetRoleForm();
          this.loadRoles();
        },
        error:()=>{
           alert('Failed to update Role');
        }
      })
    }else{
    this.masterSer.createRole(this.roleForm.value).subscribe({
      next: () => {
        alert('Role saved successfully');
        this.resetRoleForm();
        this.loadRoles();
      },
      error: () => alert('Failed to save role'),
    });
  }
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const payload = this.categoryForm.value
    if (payload.categoryId > 0) {
      this.masterSer.updateCategory(payload.categoryId, payload).subscribe({
        next: () => {
          alert('Category updated successfully');
          this.resetCategoryForm();
          this.loadCategories();
        }, error: () => {
          alert('Failed to update category')
        }
      })
    } else {
      this.masterSer.createCategory(this.categoryForm.value).subscribe({
        next: () => {
          alert('Category saved successfully');
          this.resetCategoryForm();
          this.loadCategories();
        },
        error: () => alert('Failed to save category'),
      });
    }
  }

  editRole(role: Role) {
    this.roleForm.patchValue({ roleId: role.roleId, roleName: role.roleName });
  }

  editCategory(category: Category) {
    this.categoryForm.patchValue({ categoryId: category.categoryId, name: category.name });
  }

  deleteRole(role: Role) {
    if (!confirm(`Delete role "${role.roleName}"?`)) return;
    // TODO: wire to delete-role endpoint when available
    alert('Delete endpoint not yet provided.');
  }

  deleteCategory(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    // TODO: wire to delete-category endpoint when available
    alert('Delete endpoint not yet provided.');
  }

  resetRoleForm() {
    this.roleForm.reset({ roleId: 0, roleName: '' });
  }

  resetCategoryForm() {
    this.categoryForm.reset({ categoryId: 0, name: '' });
  }

  onRoleSearch(value: string) {
    this.roleSearch.set(value);
  }

  onCategorySearch(value: string) {
    this.categorySearch.set(value);
  }
}
