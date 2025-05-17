
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.create')); ?> <?php echo e(trans('cruds.produit.title_singular')); ?>

    </div>

    <div class="card-body">
        <form method="POST" action="<?php echo e(route("admin.produits.store")); ?>" enctype="multipart/form-data">
            <?php echo csrf_field(); ?>
            <div class="form-group">
                <label class="required" for="nom"><?php echo e(trans('cruds.produit.fields.nom')); ?></label>
                <input class="form-control <?php echo e($errors->has('nom') ? 'is-invalid' : ''); ?>" type="text" name="nom" id="nom" value="<?php echo e(old('nom', '')); ?>" required>
                <?php if($errors->has('nom')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('nom')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.produit.fields.nom_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="prix"><?php echo e(trans('cruds.produit.fields.prix')); ?></label>
                <input class="form-control <?php echo e($errors->has('prix') ? 'is-invalid' : ''); ?>" type="number" name="prix" id="prix" value="<?php echo e(old('prix', '')); ?>" step="0.01" required>
                <?php if($errors->has('prix')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('prix')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.produit.fields.prix_helper')); ?></span>
            </div>
            <div class="form-group">
                <label for="description"><?php echo e(trans('cruds.produit.fields.description')); ?></label>
                <input class="form-control <?php echo e($errors->has('description') ? 'is-invalid' : ''); ?>" type="text" name="description" id="description" value="<?php echo e(old('description', '')); ?>">
                <?php if($errors->has('description')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('description')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.produit.fields.description_helper')); ?></span>
            </div>
            <div class="form-group">
                <label class="required" for="stock"><?php echo e(trans('cruds.produit.fields.stock')); ?></label>
                <input class="form-control <?php echo e($errors->has('stock') ? 'is-invalid' : ''); ?>" type="number" name="stock" id="stock" value="<?php echo e(old('stock', '')); ?>" step="1" required>
                <?php if($errors->has('stock')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('stock')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.produit.fields.stock_helper')); ?></span>
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
<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/produits/create.blade.php ENDPATH**/ ?>