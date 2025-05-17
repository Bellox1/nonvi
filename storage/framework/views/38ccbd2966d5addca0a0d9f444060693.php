
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.create')); ?> <?php echo e(trans('cruds.client.title_singular')); ?>

    </div>

    <div class="card-body">
        <form method="POST" action="<?php echo e(route("admin.clients.store")); ?>" enctype="multipart/form-data">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label class="required" for="nom"><?php echo e(trans('cruds.client.fields.nom')); ?></label>
                <input class="form-control <?php echo e($errors->has('nom') ? 'is-invalid' : ''); ?>" type="text" name="nom" id="nom" value="<?php echo e(old('nom', '')); ?>" required>
                <?php if($errors->has('nom')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('nom')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.client.fields.nom_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="telephone"><?php echo e(trans('cruds.client.fields.telephone')); ?></label>
                <input class="form-control <?php echo e($errors->has('telephone') ? 'is-invalid' : ''); ?>" type="number" name="telephone" id="telephone" value="<?php echo e(old('telephone', '')); ?>" step="1" required>
                <?php if($errors->has('telephone')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('telephone')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.client.fields.telephone_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="password"><?php echo e(trans('cruds.client.fields.password')); ?></label>
                <input class="form-control <?php echo e($errors->has('password') ? 'is-invalid' : ''); ?>" type="password" name="password" id="password" required>
                <?php if($errors->has('password')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('password')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.client.fields.password_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="email"><?php echo e(trans('cruds.client.fields.email')); ?></label>
                <input class="form-control <?php echo e($errors->has('email') ? 'is-invalid' : ''); ?>" type="email" name="email" id="email" value="<?php echo e(old('email')); ?>" required>
                <?php if($errors->has('email')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('email')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.client.fields.email_helper')); ?></span>
            </div>
            <div class="form-group">
                <button class="btn btn-danger" type="submit">
                    <?php echo e(trans('global.save')); ?>

                </button>
            </div>
        </form>
    </div>
</div>



<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/clients/create.blade.php ENDPATH**/ ?>