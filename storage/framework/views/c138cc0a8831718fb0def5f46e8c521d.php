
<?php $__env->startSection('content'); ?>
<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.show')); ?> <?php echo e(trans('cruds.user.title')); ?>

    </div>

    <div class="card-body">
        <div class="form-group">
            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.users.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
            <table class="table table-bordered table-striped">
                <tbody>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.user.fields.id')); ?>

                        </th>
                        <td>
                            <?php echo e($user->id); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.user.fields.name')); ?>

                        </th>
                        <td>
                            <?php echo e($user->name); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.user.fields.email')); ?>

                        </th>
                        <td>
                            <?php echo e($user->email); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.user.fields.email_verified_at')); ?>

                        </th>
                        <td>
                            <?php echo e($user->email_verified_at); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.user.fields.roles')); ?>

                        </th>
                        <td>
                            <?php $__currentLoopData = $user->roles; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $roles): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <span class="label label-info"><?php echo e($roles->title); ?></span>
                            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.user.fields.salaire')); ?>

                        </th>
                        <td>
                            <?php echo e($user->salaire); ?>

                        </td>
                    </tr>
                    <tr>
    <th>
    <?php echo e(trans('cruds.user.fields.qr_code')); ?>

</th>
<td>
    <?php if(Storage::disk('public')->exists("qrcodes/{$user->id}.png")): ?>
        <img src="<?php echo e(asset("storage/qrcodes/{$user->id}.png")); ?>" alt="QR Code de <?php echo e($user->name); ?>" width="200">
        <p class="mt-2">
            <a href="<?php echo e(asset("storage/qrcodes/{$user->id}.png")); ?>" class="btn btn-sm btn-success" download>
                <?php echo e(trans('cruds.user.fields.qr_code_download')); ?>

            </a>
        </p>
    <?php else: ?>
        <span class="text-danger">
            <?php echo e(trans('cruds.user.fields.qr_code_missing')); ?>

        </span>
    <?php endif; ?>
</td>
</tr>
                </tbody>
            </table>
<a href="<?php echo e(route('admin.users.carte', ['id' => $user->id, 'name' => $user->name])); ?>" class="btn btn-info">
    <?php echo e(trans('cruds.user.fields.voir_imprimer_carte')); ?>

</a>

            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.users.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
        </div>
    </div>
</div>



<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/users/show.blade.php ENDPATH**/ ?>