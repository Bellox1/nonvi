
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.show')); ?> <?php echo e(trans('cruds.reservation.title')); ?>

    </div>

    <div class="card-body">
        <div class="form-group">
            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.reservations.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
            <table class="table table-bordered table-striped">
                <tbody>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.reservation.fields.id')); ?>

                        </th>
                        <td>
                            <?php echo e($reservation->id); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.reservation.fields.statut')); ?>

                        </th>
                        <td>
                            <?php echo e(App\Models\Reservation::STATUT_SELECT[$reservation->statut] ?? ''); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.reservation.fields.user')); ?>

                        </th>
                        <td>
                            <?php echo e($reservation->user->name ?? ''); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.reservation.fields.station_depart')); ?>

                        </th>
                        <td>
                            <?php echo e($reservation->station_depart->nom ?? ''); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.reservation.fields.station_arrivee')); ?>

                        </th>
                        <td>
                            <?php echo e($reservation->station_arrivee->nom ?? ''); ?>

                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.reservations.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
        </div>
    </div>
</div>



<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/reservations/show.blade.php ENDPATH**/ ?>