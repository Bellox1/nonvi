
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.create')); ?> <?php echo e(trans('cruds.station.title_singular')); ?>

    </div>

    <div class="card-body">
        <form method="POST" action="<?php echo e(route("admin.stations.store")); ?>" enctype="multipart/form-data">
            <?php echo csrf_field(); ?>

            
            <div class="form-group">
                <label class="required" for="nom"><?php echo e(trans('cruds.station.fields.nom')); ?></label>
                <input class="form-control <?php echo e($errors->has('nom') ? 'is-invalid' : ''); ?>" type="text" name="nom" id="nom" value="<?php echo e(old('nom', '')); ?>" required>
                <?php if($errors->has('nom')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('nom')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.station.fields.nom_helper')); ?></span>
            </div>

            
            <div class="form-group">
                <label for="adresse">Adresse</label>
                <input class="form-control <?php echo e($errors->has('adresse') ? 'is-invalid' : ''); ?>" type="text" name="adresse" id="adresse" value="<?php echo e(old('adresse', '')); ?>">
                <?php if($errors->has('adresse')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('adresse')); ?>

                    </div>
                <?php endif; ?>
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

<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/stations/create.blade.php ENDPATH**/ ?>