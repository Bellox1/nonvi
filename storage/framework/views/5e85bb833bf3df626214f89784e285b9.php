
<?php $__env->startSection('content'); ?>

<div class="card">
    <div class="card-header">
        <?php echo e(trans('global.create')); ?> <?php echo e(trans('cruds.reservation.title_singular')); ?>

    </div>

    <div class="card-body">
        <form method="POST" action="<?php echo e(route("admin.reservations.store")); ?>" enctype="multipart/form-data">
            <?php echo csrf_field(); ?>

            
            <div class="form-group">
                <label class="required" for="heure_depart"><?php echo e(trans('cruds.reservation.fields.heure_depart')); ?></label>
                <select class="form-control <?php echo e($errors->has('heure_depart') ? 'is-invalid' : ''); ?>" name="heure_depart" id="heure_depart" required>
                    <option value disabled <?php echo e(old('heure_depart') === null ? 'selected' : ''); ?>><?php echo e(trans('global.pleaseSelect')); ?></option>
                    <?php $__currentLoopData = \App\Models\Reservation::HEURE_DEPART_SELECT; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($key); ?>" <?php echo e(old('heure_depart') == $key ? 'selected' : ''); ?>><?php echo e($label); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('heure_depart')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('heure_depart')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.reservation.fields.heure_depart_helper')); ?></span>
            </div>

            
            <div class="form-group">
    <label class="required" for="nombre_tickets"><?php echo e(trans('cruds.reservation.fields.nombre_tickets')); ?></label>
    <input 
        class="form-control <?php echo e($errors->has('nombre_tickets') ? 'is-invalid' : ''); ?>" 
        type="number" 
        name="nombre_tickets" 
        id="nombre_tickets" 
        value="<?php echo e(old('nombre_tickets', 1)); ?>" 
        min="1" 
        required
    >
    <?php if($errors->has('nombre_tickets')): ?>
        <div class="invalid-feedback">
            <?php echo e($errors->first('nombre_tickets')); ?>

        </div>
    <?php endif; ?>
    <span class="help-block"><?php echo e(trans('cruds.reservation.fields.nombre_tickets_helper')); ?></span>
</div>


            
            <div class="form-group">
                <label class="required"><?php echo e(trans('cruds.reservation.fields.moyen_paiement')); ?></label>
                <select class="form-control <?php echo e($errors->has('moyen_paiement') ? 'is-invalid' : ''); ?>" name="moyen_paiement" id="moyen_paiement" required>
                    <option value disabled <?php echo e(old('moyen_paiement') === null ? 'selected' : ''); ?>><?php echo e(trans('global.pleaseSelect')); ?></option>
                    <?php $__currentLoopData = \App\Models\Reservation::MOYEN_PAIEMENT_SELECT; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $key => $label): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($key); ?>" <?php echo e(old('moyen_paiement') === $key ? 'selected' : ''); ?>><?php echo e($label); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('moyen_paiement')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('moyen_paiement')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.reservation.fields.moyen_paiement_helper')); ?></span>
            </div>

            
            <div class="form-group">
                <label class="required" for="client_id"><?php echo e(trans('cruds.reservation.fields.client')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('client_id') ? 'is-invalid' : ''); ?>" name="client_id" id="client_id" required>
                    <?php $__currentLoopData = $clients; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('client_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('client_id')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('client_id')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.reservation.fields.client_helper')); ?></span>
            </div>

            
            <div class="form-group">
                <label for="user_id"><?php echo e(trans('cruds.reservation.fields.user')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('user_id') ? 'is-invalid' : ''); ?>" name="user_id" id="user_id">
                    <?php $__currentLoopData = $users; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('user_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('user_id')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('user_id')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.reservation.fields.user_helper')); ?></span>
            </div>

            
            <div class="form-group">
                <label class="required" for="station_depart_id"><?php echo e(trans('cruds.reservation.fields.station_depart')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('station_depart_id') ? 'is-invalid' : ''); ?>" name="station_depart_id" id="station_depart_id" required>
                    <?php $__currentLoopData = $station_departs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('station_depart_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('station_depart_id')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('station_depart_id')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.reservation.fields.station_depart_helper')); ?></span>
            </div>

            
            <div class="form-group">
                <label class="required" for="station_arrivee_id"><?php echo e(trans('cruds.reservation.fields.station_arrivee')); ?></label>
                <select class="form-control select2 <?php echo e($errors->has('station_arrivee_id') ? 'is-invalid' : ''); ?>" name="station_arrivee_id" id="station_arrivee_id" required>
                    <?php $__currentLoopData = $station_arrivees; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $id => $entry): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <option value="<?php echo e($id); ?>" <?php echo e(old('station_arrivee_id') == $id ? 'selected' : ''); ?>><?php echo e($entry); ?></option>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </select>
                <?php if($errors->has('station_arrivee_id')): ?>
                    <div class="invalid-feedback">
                        <?php echo e($errors->first('station_arrivee_id')); ?>

                    </div>
                <?php endif; ?>
                <span class="help-block"><?php echo e(trans('cruds.reservation.fields.station_arrivee_helper')); ?></span>
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

<?php echo $__env->make('layouts.admin', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH C:\Users\hp EliteBook 840 G5\Desktop\nonvi\resources\views/admin/reservations/create.blade.php ENDPATH**/ ?>