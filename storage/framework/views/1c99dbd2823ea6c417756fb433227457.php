
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.show')); ?> <?php echo e(trans('cruds.client.title')); ?>

    </div>

    <div class="card-body">
        <div class="form-group">
            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.clients.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
            <table class="table table-bordered table-striped">
                <tbody>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.client.fields.id')); ?>

                        </th>
                        <td>
                            <?php echo e($client->id); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.client.fields.nom')); ?>

                        </th>
                        <td>
                            <?php echo e($client->nom); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.client.fields.telephone')); ?>

                        </th>
                        <td>
                            <?php echo e($client->telephone); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.client.fields.email')); ?>

                        </th>
                        <td>
                            <?php echo e($client->email); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.client.fields.email_verified_at')); ?>

                        </th>
                        <td>
<?php if($client->email_verified_at): ?>
        <span class="badge badge-success"><?php echo e($client->email_verified_at); ?></span>
    <?php else: ?>
        <span class="badge badge-danger"><?php echo e(__('global.not_verified')); ?></span>
    <?php endif; ?>                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.clients.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
        </div>
    </div>
</div>



<?php $__env->stopSection(); ?> 
<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/clients/show.blade.php ENDPATH**/ ?>