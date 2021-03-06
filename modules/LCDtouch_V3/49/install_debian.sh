#!/bin/sh

echo "Compiling the LCD overlay from .dts to .dtbo"
dtc -O dtb -o ../CHAI-LCDtouch5-00A0.dtbo -b 0 -@ ../CHAI-LCDtouch5-00A0.dts
if [ -e ../CHAI-LCDtouch5-00A0.dtbo ]
then
	echo Tree overlay compiled ok.
else
	echo Error compiling tree overlay
	exit 1
fi

echo "Compiling the main device tree from .dts to .dtb"
wget https://github.com/RobertCNelson/dtb-rebuilder/archive/4.9-ti.zip
unzip 4.9-ti.zip
cd dtb-rebuilder-4.9-ti/src/arm/
patch < ../../../am33xx.dtsi.patch
cd ../..
make src/arm/am335x-boneblack-emmc-overlay.dtb 
KERNEL_VERSION=$(uname -r)
mkdir -p /boot/dtbs/$KERNEL_VERSION/
cp -v src/arm/*.dtb /boot/dtbs/$KERNEL_VERSION/
cp src/arm/am335x-boneblack-emmc-overlay.dtb /boot/dtbs/*/

cd ..
rm -r dtb-rebuilder-4.9-ti
rm 4.9-ti.zip 
cd ..

cp CHAI-LCDtouch5-00A0.dtbo /lib/firmware/CHAI-LCDtouch5-00A0.dtbo

#rm 49/4.9-ti.zip
#rm -r 49/dtb-rebuilder-4.9-ti/

cp capemgr /etc/default/

cp dtbo /etc/initramfs-tools/hooks/

cp /boot/initrd* /boot/initrd*.org

/opt/scripts/tools/developers/update_initrd.sh

cd ft5x0x
make

if [ -e ft5x0x_ts.ko ]
then
	cp ft5x0x_ts.ko /lib/modules/$(uname -r)/kernel/drivers/input/touchscreen
	depmod -a

	echo ft5x0x_ts > /etc/modules-load.d/ft5x0x_ts.conf
else
	echo Error compiling touch driver
	exit 1
fi

process_uEnv () {
	if [ -e $1 ]
	then
		echo processing $1
		echo "cape_enable=bone_capemgr.enable_partno=chai-pcr,CHAI-LCDtouch5" >> $1
		echo "cape_disable=bone_capemgr.disable_partno=BB-BONELT-HDMI,BB-BONELT-HDMIN,BB-SPIDEV0,BB-SPIDEV1,BB-BONE-EMMC-2G" >> $1
		echo "dtb=am335x-boneblack-emmc-overlay.dtb" >> $1
		sed -i -e 's:enable_uboot_cape_universal=1::g' $1
		sed -i -e 's:cape_universal=enable:cape_universal=disable:g' $1
	fi
}

process_uEnv /boot/uEnv.txt
process_uEnv /boot/uEnv.sdcard.txt
process_uEnv /boot/uEnv.72check.txt

sync

exit 0
