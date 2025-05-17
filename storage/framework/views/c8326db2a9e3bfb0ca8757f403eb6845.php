
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.show')); ?> <?php echo e(trans('cruds.coli.title')); ?>

    </div>

    <div class="card-body">
        <div class="form-group">
            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.colis.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
            <table class="table table-bordered table-striped">
                <tbody>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.coli.fields.id')); ?>

                        </th>
                        <td>
                            <?php echo e($coli->id); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.coli.fields.prix')); ?>

                        </th>
                        <td>
                            <?php echo e($coli->prix); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.coli.fields.statut')); ?>

                        </th>
                        <td>
                            <?php echo e(App\Models\Coli::STATUT_SELECT[$coli->statut] ?? ''); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.coli.fields.station_depart')); ?>

                        </th>
                        <td>
                            <?php echo e($coli->station_depart->nom ?? ''); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.coli.fields.station_arrivee')); ?>

                        </th>
                        <td>
                            <?php echo e($coli->station_arrivee->nom ?? ''); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.coli.fields.user')); ?>

                        </th>
                        <td>
                            <?php echo e($coli->user->name ?? ''); ?>

                        </td>
                    </tr>
                    <tr>
                        <th>
                            <?php echo e(trans('cruds.coli.fields.expediteur')); ?>

                        </th>
                        <td>
                            <?php echo e($coli->expediteur->nom ?? ''); ?>

                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="form-group">
                <a class="btn btn-default" href="<?php echo e(route('admin.colis.index')); ?>">
                    <?php echo e(trans('global.back_to_list')); ?>

                </a>
            </div>
        </div>
    </div>
</div>



<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/colis/show.blade.php ENDPATH**/ ?>